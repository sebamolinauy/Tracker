// Requirements
import { Theme } from '@radix-ui/themes';
import {
    createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';


// Constants
const THEME_STORAGE_KEY = 'theme';


// Variables
const Context = createContext({});


// Internal
const getCurrentTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const getStoredTheme = () => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored && (stored === 'light' || stored === 'dark')) {
            return stored;
        }
    } catch (error) {
        console.warn('Error reading theme from localStorage:', error);
    }
    return getCurrentTheme();
};

const setStoredTheme = (theme) => {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.warn('Error saving theme to localStorage:', error);
    }
};


// Exported
export const ThemeContext = ({ children }) => {
    const [theme, setTheme] = useState(getStoredTheme);

    const handleSetTheme = useCallback((newTheme) => {
        setTheme(newTheme);
        setStoredTheme(newTheme);
    }, []);

    const state = useMemo(() => ({
        theme, setTheme: handleSetTheme,
    }), [theme, handleSetTheme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            if (!storedTheme) {
                const systemTheme = e.matches ? 'dark' : 'light';
                setTheme(systemTheme);
            }
        };

        mediaQuery.addEventListener('change', handler);

        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, []);

    return (
        <Context.Provider value={state}>
            <Theme accentColor="orange" grayColor="mauve" appearance={theme} hasBackground={false}>
                {children}
            </Theme>
        </Context.Provider>
    );
};


export const useTheme = () => {
    const { theme, setTheme } = useContext(Context);
    const themeToggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);
    return { theme, themeToggle };
};
