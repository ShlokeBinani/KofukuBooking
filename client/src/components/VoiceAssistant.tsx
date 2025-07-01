import { useEffect, useState } from 'react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface VoiceAssistantProps {
  onVoiceCommand: (command: string) => void;
}

export function VoiceAssistant({ onVoiceCommand }: VoiceAssistantProps) {
  const { isListening, transcript, isSupported, hasNetworkError, startListening, stopListening, resetTranscript } = useVoiceRecognition();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (transcript && transcript.toLowerCase().includes('hey kofi')) {
      setIsActive(true);
      speak("Hello! I'm Kofi, your room booking assistant. How can I help you?");
      resetTranscript();
      return;
    }
    
    if (isActive && transcript && !transcript.toLowerCase().includes('hey kofi') && transcript.trim() !== '') {
      processVoiceCommand(transcript);
    }
  }, [transcript, isActive]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('book') && lowerCommand.includes('room')) {
      onVoiceCommand(command);
      speak("I'll help you book a room. Let me check availability.");
      setIsActive(false);
    }
    
    if (lowerCommand.includes('cancel') || lowerCommand.includes('stop')) {
      setIsActive(false);
      speak("Goodbye! Call me anytime with 'Hey Kofi'");
      stopListening();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsActive(false);
    } else {
      if (hasNetworkError) {
        // Provide fallback text input mode
        const command = prompt("Voice recognition has network issues. Please type your command (e.g., 'book conference room 1'):");
        if (command) {
          setIsActive(true);
          processVoiceCommand(command);
          setIsActive(false);
        }
      } else {
        startListening();
        // When manually activated, treat it as "Hey Kofi"
        setIsActive(true);
        speak("Hello! I'm listening. How can I help you book a room?");
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
        Voice not supported
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={toggleListening}
        className={`relative p-3 rounded-full transition-all duration-300 ${
          hasNetworkError
            ? 'bg-yellow-500 hover:bg-yellow-600'
            : isListening 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
        }`}
        size="lg"
        title={hasNetworkError ? "Voice recognition has network issues - click for text input" : "Click to activate voice commands or say 'Hey Kofi'"}
      >
        {hasNetworkError ? (
          <span className="text-xs font-bold">ABC</span>
        ) : isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        {isListening && !hasNetworkError && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        )}
        {hasNetworkError && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"></div>
        )}
      </Button>

      {isListening && (
        <div className="fixed top-20 right-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 z-40 border border-white/20 animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 bg-blue-500 rounded-full animate-pulse"
                  style={{
                    height: Math.random() * 20 + 10,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <div>
              <p className="text-blue-800 font-medium">
                {hasNetworkError ? 'Voice Network Issue' : 'Kofi Listening...'}
              </p>
              <p className="text-blue-600 text-sm">
                {hasNetworkError 
                  ? 'Click button for text input mode'
                  : isActive 
                  ? 'Speak your command' 
                  : 'Say "Hey Kofi" or click to activate'
                }
              </p>
              {transcript && !hasNetworkError && (
                <p className="text-blue-700 text-sm mt-1 italic">"{transcript}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
