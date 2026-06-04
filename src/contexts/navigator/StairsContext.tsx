import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import type { Stair, AddStair, UpdateStair } from '../../types/navigator/Stair';
import { getStairs as getStairsAPI, addStair as addStairAPI, modifyStair, deleteStair as deleteStairAPI } from '../../api/stair.api';
import { normalizeError } from '../../api/errors';

export type StairsContextValue = {
    isLoading: boolean;
    stair: Stair | null;
    stairs: Stair[];
    isError: boolean;
    error: string | null;
    clearError: () => void;
    getStairs: () => Promise<Stair[]>;
    addStair: (dto: AddStair) => Promise<Stair | null>;
    updateStair: (id: string, dto: UpdateStair) => Promise<Stair | null>;
    deleteStair: (id: string) => Promise<Stair | null>;
};

type StairsProviderProps = {
    children: React.ReactNode;
};

const StairsContext = createContext<StairsContextValue | undefined>(undefined);

export const StairsProvider = ({ children }: StairsProviderProps) => {
    const [stair, setStair] = useState<Stair | null>(null);
    const [stairs, setStairs] = useState<Stair[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
        setIsError(false);
    }, []);

    const getStairs = async (): Promise<Stair[]> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let res = [] as Stair[];

        try {
            res = await getStairsAPI();
            
            if (JSON.stringify(res) !== JSON.stringify(stairs)) {
                setStairs(res);
            }

        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
            setStairs([]);
        } finally {
            setIsLoading(false);
        }

        return res;
    };

    const addStair = async (dto: AddStair): Promise<Stair | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let stair: Stair | null = null;

        try {
            stair = await addStairAPI(dto);
            setStairs((xs) => [...xs, stair as Stair]);
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setStair(stair);
        }

        return stair;
    };

    const updateStair = async (id: string, dto: UpdateStair): Promise<Stair | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let updated: Stair | null = null;

        try {
            updated = await modifyStair(id, dto);
            const withoutThis = stairs.filter(x => x.id !== updated!.id)
            withoutThis.push(updated)
            withoutThis.sort((a, b) => (a.id < b.id ? -1 : 1))
            setStairs(withoutThis);
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setStair(updated);
        }

        return updated;
    };

    const deleteStair = async (id: string): Promise<Stair | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let deleted: Stair | null = null;

        try {
            deleted = await deleteStairAPI(id);
            setStairs((x) => x.filter((y) => y.id !== id));
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setStair(deleted);
        }

        return deleted;
    };

    const value = useMemo<StairsContextValue>(() => ({
        stair,
        stairs,
        isLoading,
        error,
        isError,
        clearError,
        getStairs,
        addStair,
        updateStair,
        deleteStair
    }), [
        stair,
        stairs,
        isLoading,
        error,
        isError,
        clearError,
        getStairs,
        addStair,
        updateStair,
        deleteStair
    ]);

    return <StairsContext.Provider value={value}>{children}</StairsContext.Provider>;
};

export const useStairs = (): StairsContextValue => {
    const context = useContext(StairsContext);
    if (!context) {
        throw new Error('useStairs must be used within a StairsProvider');
    }

    return context;
};
