import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  hasNetworkError: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useVoiceRecognition(): VoiceRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionInstance.onstart = () => {
      setIsListening(true);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access to use voice commands.');
        setIsListening(false);
      } else if (event.error === 'network') {
        console.warn('Network error in speech recognition - voice commands may not work properly');
        setHasNetworkError(true);
        // Don't stop listening on network errors, as it might recover
        return;
      } else {
        setIsListening(false);
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    hasNetworkError,
    startListening,
    stopListening,
    resetTranscript,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
