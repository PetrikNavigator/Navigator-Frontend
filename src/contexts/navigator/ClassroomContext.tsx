import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import type { Classroom, AddClassroom, UpdateClassroom } from '../../types/navigator/Classroom';
import { getClassrooms as getClassroomsAPI, addClassroom as addClassroomAPI, modifyClassroom, deleteClassroom as deleteClassroomAPI } from '../../api/classroom.api';
import { normalizeError } from '../../api/errors';

export type ClassroomContextValue = {
    isLoading: boolean;
    classroom: Classroom | null;
    classrooms: Classroom[];
    isError: boolean;
    error: string | null;
    clearError: () => void;
    getClassrooms: (premise: string) => Promise<Classroom[]>;
    createClassroom: (dto: AddClassroom) => Promise<Classroom | null>;
    updateClassroom: (id: string, dto: UpdateClassroom) => Promise<Classroom | null>;
    deleteClassroom: (id: string) => Promise<Classroom | null>;
};

type ClassroomProviderProps = {
    children: React.ReactNode;
};

const ClassroomContext = createContext<ClassroomContextValue | undefined>(undefined);

export const ClassroomProvider = ({ children }: ClassroomProviderProps) => {
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
        setIsError(false);
    }, []);

    const getClassrooms = async (premise: string): Promise<Classroom[]> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let res = [] as Classroom[]

        try {
            res = await getClassroomsAPI(premise);

            if (JSON.stringify(res) !== JSON.stringify(classrooms)) {
                setClassrooms(res);
            }

        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
            setClassrooms([]);
        } finally {
            setIsLoading(false);
        }

        return res;
    };

    const createClassroom = async (dto: AddClassroom): Promise<Classroom | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let classroom: Classroom | null = null;

        try {
            classroom = await addClassroomAPI(dto);
            setClassrooms((xs) => [...xs, classroom as Classroom]);
        } catch (err: unknown) {
            const normalized = normalizeError(err)
            setError(normalized);
            setIsError(true);
            throw normalized
        } finally {
            setIsLoading(false);
            setClassroom(classroom);
        }

        return classroom;
    };

    const updateClassroom = async (id: string, dto: UpdateClassroom): Promise<Classroom | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let classroom = null;

        try {
            classroom = await modifyClassroom(id, dto);
            const updated = classroom as Classroom
            const withoutThis = classrooms.filter(x => x.id !== updated!.id)
            withoutThis.push(updated)
            withoutThis.sort((a, b) => (a.id < b.id ? -1 : 1))
            setClassrooms(withoutThis)
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setClassroom(classroom);
        }

        return classroom;
    };

    const deleteClassroom = async (id: string): Promise<Classroom | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        let classroom = null;

        try {
            classroom = await deleteClassroomAPI(id);
            setClassrooms((x) => x.filter((y) => y.id !== id))
        } catch (err: unknown) {
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setIsLoading(false);
            setClassroom(classroom);
        }

        return classroom;
    };

    const value = useMemo<ClassroomContextValue>(() => ({
        classroom,
        classrooms,
        isLoading,
        error,
        isError,
        clearError,
        getClassrooms,
        createClassroom,
        updateClassroom,
        deleteClassroom
    }), [
        classroom,
        classrooms,
        isLoading,
        error,
        isError,
        clearError,
        getClassrooms,
        createClassroom,
        updateClassroom,
        deleteClassroom
    ]);

    return <ClassroomContext.Provider value={value}>{children}</ClassroomContext.Provider>;
};

export const useClassroom = (): ClassroomContextValue => {
    const context = useContext(ClassroomContext);
    if (!context) {
        throw new Error('useClassroom must be used within a ClassroomProvider');
    }

    return context;
};
