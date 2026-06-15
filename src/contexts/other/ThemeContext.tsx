import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextType {
    theme: boolean;
    change: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** `true` = dark, `false` = light. The boolean maps to a daisyui theme
 *  name applied to <html data-theme>, which themes the whole app. */
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<boolean>(
        () => localStorage.getItem("theme")?.toLocaleLowerCase() === "true",
    );

    const change = (val: boolean) => {
        setTheme(val);
        localStorage.setItem("theme", JSON.stringify(val));
    };

    // Reflect the current theme onto the document so daisyui restyles
    // everything (and any consumer reading the CSS theme stays in sync).
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme ? "dark" : "light");
    }, [theme]);

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