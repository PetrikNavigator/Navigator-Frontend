import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import { normalizeError } from '../../api/errors';
import i18n from '../../i18n/i18n';
import type { Translation, TranslationGroup } from '../../types/Translation';
import {
    getTranslations as api_get,
    addTranslation as api_add,
    modifyTranslation as api_modify,
    deleteTranslation as api_delete,
} from '../../api/translations.api';

export type TranslationsContextValue = {
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    clearError: () => void;
    /** Raw rows (one per lang_key + text_key). */
    translations: Translation[];
    /** Rows folded into one entry per codename. */
    groups: TranslationGroup[];
    /** Distinct language keys present in the data, sorted. */
    languages: string[];
    getTranslations: () => Promise<Translation[] | null>;
    /** Create a codename with a text per language. */
    createGroup: (text_key: string, values: Record<string, string>) => Promise<void>;
    /** Diff the codename's languages against `values`: add/update/remove rows. */
    updateGroup: (text_key: string, values: Record<string, string>) => Promise<void>;
    /** Remove every language row for a codename. */
    deleteGroup: (text_key: string) => Promise<void>;
};

type TranslationsProviderProps = {
    children: React.ReactNode;
};

const TranslationsContext = createContext<TranslationsContextValue | undefined>(undefined);

export const TranslationsProvider = ({ children }: TranslationsProviderProps) => {
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
        setIsError(false);
    }, []);

    const groups = useMemo<TranslationGroup[]>(() => {
        const map = new Map<string, Record<string, string>>();
        for (const row of translations) {
            const values = map.get(row.text_key) ?? {};
            values[row.lang_key] = row.text;
            map.set(row.text_key, values);
        }
        return Array.from(map, ([text_key, values]) => ({ text_key, values }))
            .sort((a, b) => a.text_key.localeCompare(b.text_key));
    }, [translations]);

    const languages = useMemo<string[]>(() => {
        const set = new Set<string>();
        for (const row of translations) set.add(row.lang_key);
        return Array.from(set).sort();
    }, [translations]);

    // Replace the active language's i18next bundle from the freshly-fetched
    // rows so any t() using a changed codename updates without a reload. Using
    // deep=false + overwrite=true means deleted keys disappear too.
    const syncActiveBundle = useCallback((rows: Translation[]) => {
        const lang = i18n.language;
        const bundle: Record<string, string> = {};
        for (const row of rows) {
            if (row.lang_key === lang) bundle[row.text_key] = row.text;
        }
        i18n.addResourceBundle(lang, 'translation', bundle, false, true);
        void i18n.changeLanguage(lang);
    }, []);

    const getTranslations = useCallback(async (): Promise<Translation[] | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        try {
            const rows = await api_get();
            setTranslations(rows);
            return rows;
        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Re-fetch all rows after a mutation, then resync the active bundle. Keeps
    // the table and the live UI authoritative without per-op optimistic state.
    const resync = useCallback(async () => {
        const rows = await api_get();
        setTranslations(rows);
        syncActiveBundle(rows);
    }, [syncActiveBundle]);

    const createGroup = useCallback(async (text_key: string, values: Record<string, string>) => {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        try {
            for (const [lang, text] of Object.entries(values)) {
                if (lang.trim() === '') continue;
                await api_add({ lang_key: lang, text_key, text });
            }
            await resync();
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
        }
    }, [resync]);

    const updateGroup = useCallback(async (text_key: string, values: Record<string, string>) => {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        try {
            const current: Record<string, string> = {};
            for (const row of translations) {
                if (row.text_key === text_key) current[row.lang_key] = row.text;
            }

            const next: Record<string, string> = {};
            for (const [lang, text] of Object.entries(values)) {
                if (lang.trim() !== '') next[lang] = text;
            }

            // Additions and text changes.
            for (const [lang, text] of Object.entries(next)) {
                if (!(lang in current)) {
                    await api_add({ lang_key: lang, text_key, text });
                } else if (current[lang] !== text) {
                    await api_modify(lang, text_key, { text });
                }
            }
            // Removed languages.
            for (const lang of Object.keys(current)) {
                if (!(lang in next)) {
                    await api_delete(lang, text_key);
                }
            }

            await resync();
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
        }
    }, [translations, resync]);

    const deleteGroup = useCallback(async (text_key: string) => {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        try {
            const langs = translations
                .filter((row) => row.text_key === text_key)
                .map((row) => row.lang_key);

            for (const lang of langs) {
                await api_delete(lang, text_key);
            }

            await resync();
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
        }
    }, [translations, resync]);

    const value = useMemo<TranslationsContextValue>(() => ({
        isLoading,
        isError,
        error,
        clearError,
        translations,
        groups,
        languages,
        getTranslations,
        createGroup,
        updateGroup,
        deleteGroup,
    }), [
        isLoading,
        isError,
        error,
        clearError,
        translations,
        groups,
        languages,
        getTranslations,
        createGroup,
        updateGroup,
        deleteGroup,
    ]);

    return <TranslationsContext.Provider value={value}>{children}</TranslationsContext.Provider>;
};

export const useTranslations = (): TranslationsContextValue => {
    const context = useContext(TranslationsContext);
    if (!context) {
        throw new Error('useTranslations must be used within a TranslationsProvider');
    }
    return context;
};
