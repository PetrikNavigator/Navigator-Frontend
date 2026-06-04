import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import type { AddBuildingRequest, Building, UpdateBuildingRequest } from '../../types/navigator/Building';
import { addBuilding as addBuildingAPI, modifyBuilding, deleteBuilding as deleteBuildingAPI, getBuildings as getBuildingsAPI } from '../../api/building.api';
import { normalizeError } from '../../api/errors';

export type BuildingsContextValue = {
    isLoading: boolean;
    building: Building | null;
    buildings: Building[];
    isError: boolean;
    error: string | null;
    clearError: () => void;
    getBuildings: () => Promise<Building[]>
    addBuilding: (dto: AddBuildingRequest) => Promise<Building | null>;
    updateBuilding: (id: string, dto: UpdateBuildingRequest) => Promise<Building | null>;
    deleteBuilding: (id: string) => Promise<Building | null>;
};

type BuildingsProviderProps = {
    children: React.ReactNode;
};

const BuildingContext = createContext<BuildingsContextValue | undefined>(undefined);

export const BuildingsProvider = ({ children }: BuildingsProviderProps) => {
    const [building, setBuilding] = useState<Building | null>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
        setIsError(false);
    }, []);

    const getBuildings = async (): Promise<Building[]> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let buildings = [] as Building[]

        try {
            buildings = await getBuildingsAPI();
        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
        } finally {
            setIsLoading(false);
            setBuildings(buildings);
        }

        return buildings;
    };

    const addBuilding = async (dto: AddBuildingRequest): Promise<Building | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let building: Building | null = null

        try {
            building = await addBuildingAPI(dto);
            setBuildings((prev) => [...prev, building!])
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setBuilding(building);
        }

        return building;
    };

    const updateBuilding = async (id: string, dto: UpdateBuildingRequest): Promise<Building | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let updated: Building | null = null

        try {
            updated = await modifyBuilding(id, dto);
            const withoutThis = buildings.filter(x => x.id !== updated!.id)
            withoutThis.push(updated)
            withoutThis.sort((a, b) => (a.id < b.id ? -1 : 1))
            setBuildings(withoutThis)
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setBuilding(updated);
        }

        return updated;
    };

    const deleteBuilding = async (id: string): Promise<Building | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let deleted = null

        try {
            deleted = await deleteBuildingAPI(id);
            setBuildings((x) => x.filter((y) => y.id !== id))
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setBuilding(deleted);
        }

        return deleted;
    };

    const value = useMemo<BuildingsContextValue>(() => ({
        building,
        buildings,
        isLoading,
        error,
        isError,
        clearError,
        getBuildings,
        addBuilding,
        updateBuilding,
        deleteBuilding
    }), [
        building,
        buildings,
        isLoading,
        error,
        isError,
        clearError,
        getBuildings,
        addBuilding,
        updateBuilding,
        deleteBuilding
    ]);

    return <BuildingContext.Provider value={value}>{children}</BuildingContext.Provider>;
};

export const useBuildings = (): BuildingsContextValue => {
    const context = useContext(BuildingContext);
    if (!context) {
        throw new Error('useBuildings must be used within an BuildingsProvider');
    }

    return context;
};
