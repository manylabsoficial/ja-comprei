// Normaliza a URL da API para garantir que sempre termine em /api (sem barra extra no final)
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

console.log('API Service initialized with URL:', API_URL);

export const api = {
    async sugerirReceitas(ingredients: string[]) {
        const url = `${API_URL}/sugerir-receitas`;
        console.log(`[API REQUEST] Sugerindo receitas... URL: ${url}`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredientes: ingredients.map(item => ({ item, quantidade: '' }))
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
