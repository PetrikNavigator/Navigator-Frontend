import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import type { LoginRequest } from '../../types/request/LoginRequest';
import { normalizeError } from '../../api/errors';
import { api_login, api_getMe, api_logout } from '../../api/auth.api';
import type { User } from '../../types/User';

export type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    isError: boolean;
    clearError: () => void;
    login: (dto: LoginRequest) => Promise<User | null>;
    getMe: () => Promise<User | null>;
    logout: () => Promise<void>;
};

type AuthProviderProps = {
    children: React.ReactNode;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // True after the initial getMe() call has completed (success or fail).
    // Lets route guards distinguish "still checking session" from "checked,
    // not logged in" without flashing the login screen on every reload.
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
        setIsError(false);
    }, []);

    const login = async (dto: LoginRequest): Promise<User | null> => {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        try {
            const u = await api_login(dto);
            setUser(u);
            return u;
        } catch (err: unknown) {
            setError(normalizeError(err));
            setIsError(true);
            // Re-throw so callers (Login page) can react. The error has
            // already been normalised so callers don't need to re-parse.
            throw normalizeError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getMe = async (): Promise<User | null> => {
        setIsLoading(true);
        let u: User | null = null;

        try {
            u = await api_getMe();
            setUser(u);
        } catch {
            // 401 / no session is the expected path on first visit. Don't
            // surface this as an error to the user — the route guards will
            // redirect them to /login.
            setUser(null);
        } finally {
            setIsLoading(false);
            setIsReady(true);
        }

        return u;
    };

    const logout = async () => {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        try {
            await api_logout();
        } catch (err: unknown) {
            // Logout best-effort: even if the server rejects, clear local
            // state so the user isn't stuck logged in. Surface the error
            // for diagnostics but proceed with the local clear.
            const normalized = normalizeError(err);
            setError(normalized);
            setIsError(true);
            throw normalized;
        } finally {
            setUser(null);
            setIsLoading(false);
        }
    }

    const value = useMemo<AuthContextValue>(() => ({
        user,
        isLoading,
        isReady,
        error,
        isError,
        clearError,
        login,
        getMe,
        logout,
    }), [
        getMe,
        isLoading,
        isReady,
        error,
        isError,
        clearError,
        login,
        logout,
        user,
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
