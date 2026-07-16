import { useState, useEffect, useRef } from 'react';

export const useCameraStream = () => {
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasFlash, setHasFlash] = useState(false);

    // Refs for forced shutdown and track management
    const videoTrackRef = useRef(null);
    const streamRef = useRef(null);
    const activeRequestRef = useRef(false);

    const stopCamera = () => {
        // Force stop all tracks from the reference to ensure shutdown even if state is out of sync
        if (streamRef.current) {
            console.log("Forcing camera shutdown...");
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`Track ${track.kind} stopped`);
            });
            streamRef.current = null;
        }

        setStream(null);
        videoTrackRef.current = null;
    };

    const startCamera = async () => {
        if (activeRequestRef.current) return;

        setIsLoading(true);
        setError(null);
        activeRequestRef.current = true;

        try {
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

            // Critical check: if component unmounted while waiting for user permission
            if (!activeRequestRef.current) {
                mediaStream.getTracks().forEach(track => track.stop());
                return;
            }

            streamRef.current = mediaStream;
            setStream(mediaStream);

            const track = mediaStream.getVideoTracks()[0];
            videoTrackRef.current = track;

            const capabilities = track.getCapabilities();
            setHasFlash('torch' in capabilities);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(err);
        } finally {
            setIsLoading(false);
            activeRequestRef.current = false;
        }
    };

    const toggleFlash = async (on) => {
        if (videoTrackRef.current && hasFlash) {
            try {
                await videoTrackRef.current.applyConstraints({
                    advanced: [{ torch: on }]
                });
            } catch (err) {
                console.error("Error toggling flash:", err);
            }
        }
    };

    // Cleanup on unmount - The ultimate safeguard
    useEffect(() => {
        activeRequestRef.current = true;
        return () => {
            activeRequestRef.current = false;
            stopCamera();
        };
    }, []);

    return {
        stream,
        error,
        isLoading,
        startCamera,
        stopCamera,
        hasFlash,
        toggleFlash
    };
};
