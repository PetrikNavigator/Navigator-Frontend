import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import type { AddCorridor, Corridor, UpdateCorridor } from '../../types/navigator/Corridor';
import { getCorridors as getCorridorsAPI, addCorridor as addCorridorAPI, modifyCorridor, deleteCorridor as deleteCorridorAPI } from '../../api/corridor.api';
import { normalizeError } from '../../api/errors';

export type CorridorContextValue = {
    isLoading: boolean;
    corridor: Corridor | null;
    corridors: Corridor[];
    isError: boolean;
    error: string | null;
    clearError: () => void;
    getCorridors: (premise: string) => Promise<Corridor[]>;
    addCorridor: (dto: AddCorridor) => Promise<Corridor | null>;
    updateCorridor: (id: string, dto: UpdateCorridor) => Promise<Corridor | null>;
    deleteCorridor: (id: string) => Promise<Corridor | null>;
};

type CorridorProviderProps = {
    children: React.ReactNode;
};

const CorridorContext = createContext<CorridorContextValue | undefined>(undefined);

export const CorridorProvider = ({ children }: CorridorProviderProps) => {
    const [corridor, setCorridor] = useState<Corridor | null>(null);
    const [corridors, setCorridors] = useState<Corridor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
        setIsError(false);
    }, []);

    const getCorridors = async (premise: string): Promise<Corridor[]> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let res = [] as Corridor[]

        try {
            res = await getCorridorsAPI(premise);

            if (JSON.stringify(res) !== JSON.stringify(corridors)) {
                setCorridors(res);
            }

        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
            setCorridors([]);
        } finally {
            setIsLoading(false);
        }

        return res;
    };

    const addCorridor = async (dto: AddCorridor): Promise<Corridor | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let corridor: Corridor | null = null;

        try {
            corridor = await addCorridorAPI(dto);
            setCorridors((xs) => [...xs, corridor as Corridor]);
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setCorridor(corridor);
        }

        return corridor;
    };

    const updateCorridor = async (id: string, dto: UpdateCorridor): Promise<Corridor | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let updated: Corridor | null = null;

        try {
            updated = await modifyCorridor(id, dto);
            const withoutThis = corridors.filter(x => x.id !== updated!.id)
            withoutThis.push(updated)
            withoutThis.sort((a, b) => (a.id < b.id ? -1 : 1))
            setCorridors(withoutThis);
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setCorridor(updated);
        }

        return updated;
    };

    const deleteCorridor = async (id: string): Promise<Corridor | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let deleted: Corridor | null = null;

        try {
            deleted = await deleteCorridorAPI(id);
            setCorridors((x) => x.filter((y) => y.id !== id));
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setCorridor(deleted);
        }

        return deleted;
    };

    const value = useMemo<CorridorContextValue>(() => ({
        corridor,
        corridors,
        isLoading,
        error,
        isError,
        clearError,
        getCorridors,
        addCorridor,
        updateCorridor,
        deleteCorridor,
    }), [
        corridor,
        corridors,
        isLoading,
        error,
        isError,
        clearError,
        getCorridors,
        addCorridor,
        updateCorridor,
        deleteCorridor,
    ]);

    return <CorridorContext.Provider value={value}>{children}</CorridorContext.Provider>;
};

export const useCorridor = (): CorridorContextValue => {
    const context = useContext(CorridorContext);
    if (!context) {
        throw new Error('useCorridor must be used within a CorridorProvider');
    }

    return context;
};
