import { useState, useEffect, useRef } from 'react';

export const useCameraStream = () => {
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasFlash, setHasFlash] = useState(false);
    const videoTrackRef = useRef(null);

    const startCamera = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' }
                }
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            // Setup track ref and check capabilities (like flash)
            const track = mediaStream.getVideoTracks()[0];
            videoTrackRef.current = track;

            const capabilities = track.getCapabilities();
            setHasFlash('torch' in capabilities);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            videoTrackRef.current = null;
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
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
