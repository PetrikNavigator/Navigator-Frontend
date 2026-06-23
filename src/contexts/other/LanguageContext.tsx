import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import i18n, { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type AppLanguage } from '../../i18n/i18n';
import { getLang } from '../../api/translations.api';

interface LanguageContextType {
    language: AppLanguage;
    setLanguage: (lang: AppLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function readStoredLanguage(): AppLanguage {
    const stored = localStorage.getItem("language")
    return SUPPORTED_LANGUAGES.includes(stored as AppLanguage)
        ? (stored as AppLanguage)
        : DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<AppLanguage>(readStoredLanguage)
    // Gate the first paint so the UI never flashes raw codenames before the
    // initial bundle arrives. Later language switches keep the old content
    // visible until the new bundle swaps in.
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        let active = true

        async function loadBundle() {
            try {
                const bundle = await getLang(language)
                if (!active) return
                i18n.addResourceBundle(language, "translation", bundle, true, true)
                await i18n.changeLanguage(language)
            } catch {
                // Network/backend failure: keep whatever bundle is already loaded.
            } finally {
                if (active) setInitialized(true)
            }
        }

        loadBundle()
        return () => { active = false }
    }, [language])

    const setLanguage = (lang: AppLanguage) => {
        setLanguageState(lang)
        localStorage.setItem("language", lang)
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {initialized ? children : null}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
