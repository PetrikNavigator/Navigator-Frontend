import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextType {
    theme: boolean;
    change: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<boolean>(false);

    const change = (val: boolean) => {
        setTheme(val);
        localStorage.setItem("theme", JSON.stringify(val));
    };

    useEffect(() => {
        change(localStorage.getItem("theme")?.toLocaleLowerCase() === "true");
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, change }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}