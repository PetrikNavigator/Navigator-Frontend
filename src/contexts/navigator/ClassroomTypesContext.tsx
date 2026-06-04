import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import { normalizeError } from '../../api/errors';
import type { AddClasroomType, ClassroomType, UpdateClasroomType } from '../../types/navigator/ClassroomType';
import { addClassroomType, deleteClassroomType as api_delete_cr_type, modifyClassroomType, getClassroomTypes as api_get_classroom_types } from '../../api/classsroom_types.api';

export type ClassroomTypeContextValue = {
    isLoading: boolean;
    classroom_type: ClassroomType | null;
    classroom_types: ClassroomType[];
    isError: boolean;
    error: string | null;
    clearError: () => void;
    getClassroomTypes: (id: string) => Promise<ClassroomType[] | null>
    createClassroomType: (dto: AddClasroomType) => Promise<ClassroomType | null>;
    updateClassroomType: (id: string, dto: UpdateClasroomType) => Promise<ClassroomType | null>;
    deleteClassroomType: (id: string) => Promise<ClassroomType | null>;
};

type ClassroomTypeProviderProps = {
    children: React.ReactNode;
};

const ClassroomTypeContext = createContext<ClassroomTypeContextValue | undefined>(undefined);

export const ClassroomTypeProvider = ({ children }: ClassroomTypeProviderProps) => {
    const [classroom_types, setClassroom_Types] = useState<ClassroomType[]>([]);
    const [classroom_type, setClassroom_Type] = useState<ClassroomType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
        setIsError(false);
    }, []);

    const getClassroomTypes = async (id: string): Promise<ClassroomType[] | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let classroom_types = [] as ClassroomType[];

        try {
            classroom_types = await api_get_classroom_types(id);
        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
        } finally {
            setIsLoading(false);
            setClassroom_Types(classroom_types);
        }

        return classroom_types;
    }

    const createClassroomType = async (dto: AddClasroomType): Promise<ClassroomType | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let classroom: ClassroomType | null = null;

        try {
            classroom = await addClassroomType(dto);
            setClassroom_Types((prev) => [...prev, classroom as ClassroomType])
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setClassroom_Type(classroom);
        }

        return classroom;
    };

    const updateClassroomType = async (id: string, dto: UpdateClasroomType): Promise<ClassroomType | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let updated: ClassroomType | null = null;

        try {
            updated = await modifyClassroomType(id, dto);
            const withoutThis = classroom_types.filter(x => x.id !== updated!.id)
            withoutThis.push(updated)
            withoutThis.sort((a, b) => (a.id < b.id ? -1 : 1))
            setClassroom_Types(withoutThis)
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setClassroom_Type(updated);
        }

        return updated;
    };

    const deleteClassroomType = async (id: string): Promise<ClassroomType | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let deleted: ClassroomType | null = null;

        try {
            deleted = await api_delete_cr_type(id);
            setClassroom_Types((x) => x.filter((y) => y.id !== id))
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setClassroom_Type(deleted);
        }

        return deleted;
    };

    const value = useMemo<ClassroomTypeContextValue>(() => ({
        classroom_type,
        classroom_types,
        isLoading,
        error,
        isError,
        clearError,
        getClassroomTypes,
        createClassroomType,
        updateClassroomType,
        deleteClassroomType
    }), [
        classroom_type,
        classroom_types,
        isLoading,
        error,
        isError,
        clearError,
        getClassroomTypes,
        createClassroomType,
        updateClassroomType,
        deleteClassroomType
    ]);

    return <ClassroomTypeContext.Provider value={value}>{children}</ClassroomTypeContext.Provider>;
};

export const useClassroomType = (): ClassroomTypeContextValue => {
    const context = useContext(ClassroomTypeContext);
    if (!context) {
        throw new Error('useClassroomType must be used within a ClassroomTypeProvider');
    }

    return context;
};
