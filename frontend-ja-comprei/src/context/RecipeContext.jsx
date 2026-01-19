import { createContext, useContext, useState, useEffect } from 'react';
import { ensureDevSession } from '../services/recipeService';
import { supabase } from '../lib/supabase';

const RecipeContext = createContext(null);

export function RecipeProvider({ children }) {
    const [recipes, setRecipes] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [user, setUser] = useState(null);

    // Auth State Listener
    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                console.log('Session restored:', session.user.email);
            }
        });

        // 2. Listen for changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);

            if (!session) {
                // Cleanup potentially sensitive data on logout
                setRecipes([]);
                setIngredients([]);
            }
        });

        // 3. Dev Mode Auto-login (Only on localhost)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            ensureDevSession().then(u => {
                if (u && !user) {
                    console.log('Dev Auto-login:', u.email);
                    // Listener will catch the sign-in event from ensureDevSession
                }
            });
        }

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        recipes,
        setRecipes,
        ingredients,
        setIngredients,
        user,
        // Helper to find a recipe by index (since AI doesn't return IDs)
        getRecipeByIndex: (index) => recipes[index] || null,
    };

    return (
        <RecipeContext.Provider value={value}>
            {children}
        </RecipeContext.Provider>
    );
}

export function useRecipes() {
    const context = useContext(RecipeContext);
    if (!context) {
        throw new Error('useRecipes must be used within a RecipeProvider');
    }
    return context;
}
