import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import type { Lift, AddLift, UpdateLift } from '../../types/navigator/Lift';
import { getLifts as getLiftsAPI, addLift as addLiftAPI, modifyLift, deleteLift as deleteLiftAPI } from '../../api/lifts.api';
import { normalizeError } from '../../api/errors';

export type LiftsContextValue = {
    isLoading: boolean;
    lift: Lift | null;
    lifts: Lift[];
    isError: boolean;
    error: string | null;
    clearError: () => void;
    getLifts: () => Promise<Lift[]>;
    addLift: (dto: AddLift) => Promise<Lift | null>;
    updateLift: (id: string, dto: UpdateLift) => Promise<Lift | null>;
    deleteLift: (id: string) => Promise<Lift | null>;
};

type LiftsProviderProps = {
    children: React.ReactNode;
};

const LiftsContext = createContext<LiftsContextValue | undefined>(undefined);

export const LiftsProvider = ({ children }: LiftsProviderProps) => {
    const [lift, setLift] = useState<Lift | null>(null);
    const [lifts, setLifts] = useState<Lift[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
        setIsError(false);
    }, []);

    const getLifts = async (): Promise<Lift[]> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let res = [] as Lift[]

        try {
            res = await getLiftsAPI();

            if (JSON.stringify(res) !== JSON.stringify(lifts)) {
                setLifts(res);
            }

        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
            setLifts([]);
        } finally {
            setIsLoading(false);
        }

        return res;
    };

    const addLift = async (dto: AddLift): Promise<Lift | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let lift: Lift | null = null;

        try {
            lift = await addLiftAPI(dto);
            setLifts((xs) => [...xs, lift as Lift]);
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setLift(lift);
        }

        return lift;
    };

    const updateLift = async (id: string, dto: UpdateLift): Promise<Lift | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let updated: Lift | null = null;

        try {
            updated = await modifyLift(id, dto);
            const withoutThis = lifts.filter(x => x.id !== updated!.id)
            withoutThis.push(updated)
            withoutThis.sort((a, b) => (a.id < b.id ? -1 : 1))
            setLifts(withoutThis);
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setLift(updated);
        }

        return updated;
    };

    const deleteLift = async (id: string): Promise<Lift | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let deleted: Lift | null = null;

        try {
            deleted = await deleteLiftAPI(id);
            setLifts((x) => x.filter((y) => y.id !== id));
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setLift(deleted);
        }

        return deleted;
    };

    const value = useMemo<LiftsContextValue>(() => ({
        lift,
        lifts,
        isLoading,
        error,
        isError,
        clearError,
        getLifts,
        addLift,
        updateLift,
        deleteLift
    }), [
        lift,
        lifts,
        isLoading,
        error,
        isError,
        clearError,
        getLifts,
        addLift,
        updateLift,
        deleteLift
    ]);

    return <LiftsContext.Provider value={value}>{children}</LiftsContext.Provider>;
};

export const useLifts = (): LiftsContextValue => {
    const context = useContext(LiftsContext);
    if (!context) {
        throw new Error('useLifts must be used within a LiftsProvider');
    }

    return context;
};
