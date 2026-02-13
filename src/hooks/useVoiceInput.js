import { useState, useEffect } from 'react';

export const useVoiceInput = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognitionInstance = new window.webkitSpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'ja-JP';

            recognitionInstance.onstart = () => setIsListening(true);
            recognitionInstance.onend = () => setIsListening(false);
            recognitionInstance.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                // Reset transcript after a short delay to allow consumption 
                // but this hook is designed to return the text to be used immediately.
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    const startListening = () => {
        if (!recognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }
        try {
            recognition.start();
        } catch (e) {
            console.error(e);
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
        }
    };

    return { isListening, transcript, startListening, stopListening, setTranscript };
};
