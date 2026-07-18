// Normaliza a URL da API para garantir que sempre termine em /api (sem barra extra no final)
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

console.log('API Service initialized with URL:', API_URL);

export const api = {
    async sugerirReceitas(ingredients: string[]) {
        const url = `${API_URL}/sugerir-receitas`;
        console.log(`[API REQUEST] Sugerindo receitas... URL: ${url}`);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const controller = new AbortController();
            // Recipe text plus image generation may use a short provider fallback.
            // Keep this above the backend's bounded work instead of aborting a
            // request that is still valid.
            const timeoutId = setTimeout(() => controller.abort(), 120000);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({
                    ingredientes: ingredients.map(item => ({ item, quantidade: '' })),
                    user_id: session?.user?.id,
                }),
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));

            console.log(`[API RESPONSE] sugerir-receitas: ${response.status}`);

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("[API ERROR] sugerir-receitas:", error);
            throw error;
        }
    },

    async trackImageRender(generationId: string, recipeIndex: number, eventType: 'image_loaded' | 'image_failed', imageUrl?: string) {
        if (!generationId) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const provider = imageUrl?.startsWith('data:') ? 'openrouter' :
            imageUrl?.includes('pollinations.ai') ? 'pollinations' : 'other';

        try {
            await fetch(`${API_URL}/generation-events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    generation_id: generationId,
                    recipe_index: recipeIndex,
                    event_type: eventType,
                    provider,
                }),
            });
        } catch (error) {
            // Telemetry must never block the recipe experience.
            console.warn('Unable to record image render telemetry:', error);
        }
    },

    async parseNota(file: File) {
        const url = `${API_URL}/analisar-nota`;
        console.log(`[API REQUEST] Analisando nota... URL: ${url}, File: ${file.name}`);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            console.log(`[API RESPONSE] analisar-nota: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Erro na API: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("[API ERROR] analisar-nota:", error);
            throw error;
        }
    },

    async transcribeAudio(audioBlob: Blob) {
        const url = `${API_URL}/voice/transcribe`;
        console.log(`[API REQUEST] Transcrevendo áudio... URL: ${url}, Size: ${audioBlob.size}`);

        const formData = new FormData();
        // Filename 'audio.webm' é importante para o backend/Whisper inferir formato, mas o server confia no header content-type ou magic bytes geralmente.
        // O backend espera 'file'
        formData.append('file', audioBlob, 'audio.webm');

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            console.log(`[API RESPONSE] transcription: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Erro na API: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("[API ERROR] transcribeAudio:", error);
            throw error;
        }
    }
};
import { supabase } from '../lib/supabase';
