import { useState, useEffect } from 'react';

// Centralized theme state — replaces the duplicated theme logic that used to
// live independently in Dashboard.jsx and LandingPage.jsx (see
// docs/DESIGN_PROPOSAL.md, seção 1.3). Default for first-time visitors (no
// saved preference) is now DARK — matching the cinematic landing — instead
// of following `prefers-color-scheme`. Returning users keep whatever they
// last chose.
export function useTheme() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'dark';
        return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return [theme, toggleTheme];
}
