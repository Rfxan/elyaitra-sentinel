import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isTTSActive: boolean;
  setIsTTSActive: (active: boolean) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscript, 
  isTTSActive, 
  setIsTTSActive 
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
        console.warn("Speech Recognition not supported in this browser.");
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  return (
    <div className="flex items-center gap-1 mr-1">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={toggleListening}
        className={cn(
            "h-8 w-8 rounded-full transition-all",
            isListening ? "text-red-500 bg-red-500/10 animate-pulse" : "text-muted-foreground hover:bg-accent"
        )}
        title={isListening ? "Stop Listening" : "Voice Message"}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => {
            const next = !isTTSActive;
            setIsTTSActive(next);
            if (!next) window.speechSynthesis.cancel();
        }}
        className={cn(
            "h-8 w-8 rounded-full transition-all",
            isTTSActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent"
        )}
        title={isTTSActive ? "Mute AI Response" : "Read Aloud AI Response"}
      >
        {isTTSActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default VoiceInput;
