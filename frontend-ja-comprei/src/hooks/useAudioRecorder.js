import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaBlob, setMediaBlob] = useState(null);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null); // Reference to the stream to stop tracks later

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            chunksRef.current = [];
            setMediaBlob(null); // Reset previous recording

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                try {
                    // Default to audio/webm;codecs=opus if supported, otherwise browser default
                    // Ideally we want something Whisper likes. modern browsers support webm/opus nicely.
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    setMediaBlob(blob);
                } catch (e) {
                    console.error("Error creating blob:", e);
                    setError("Erro ao processar áudio.");
                }

                // Cleanup tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Permissão de microfone negada ou não disponível.");
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    }, [isRecording]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return {
        isRecording,
        recordingTime,
        mediaBlob,
        error,
        startRecording,
        stopRecording,
        hasAudio: !!mediaBlob
    };
};
