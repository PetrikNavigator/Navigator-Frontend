import React, {
    createContext,
    useContext,
    useState
} from 'react';
import { normalizeError } from '../../api/errors';
import type { FullGraph } from '../../types/FullGraph';
import { getFullGraph as getFullGraphAPI } from '../../api/public.api'

export type GraphContextValue = {
    graph: FullGraph | null;

    isLoading: boolean;
    isError: boolean;
    error: string | null

    getFullGraph: () => Promise<FullGraph | null>;
    invalidateGraph: () => void
};

type GraphProviderProps = {
    children: React.ReactNode;
};

const GraphContext = createContext<GraphContextValue | undefined>(undefined);

export const GraphProvider = ({ children }: GraphProviderProps) => {
    const [graph, setGraph] = useState<FullGraph | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGraph = async () => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let graphData: FullGraph | null = null;

        try {
            graphData = await getFullGraphAPI();
        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
        } finally {
            setIsLoading(false);
            setGraph(graphData);
        }

        return graphData;
    }

    const getFullGraph = async () => {
        if (graph)
            return graph

        return fetchGraph()
    };

    const invalidateGraph = async () => {
        fetchGraph()
    }

    const value = {
        graph,
        isLoading,
        isError,
        error,
        getFullGraph,
        invalidateGraph
    };

    return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
};

export const useGraph = (): GraphContextValue => {
    const context = useContext(GraphContext);
    if (!context) {
        throw new Error('useGraph must be used within a GraphProvider');
    }

    return context;
};
