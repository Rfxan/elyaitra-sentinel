/**
 * VoiceInput.jsx — Task 49-55
 * Web Speech API voice capture for the Sentinel dashboard.
 * Shows a live transcript, auto-submits on speech end,
 * and includes a TTS speaker-icon toggle.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * @param {object} props
 * @param {(text: string) => void} props.onTranscript   Called when speech ends with the final transcript
 * @param {boolean}                props.isTTSEnabled   Whether TTS is currently active
 * @param {(v: boolean) => void}   props.setTTSEnabled  Toggles TTS on/off
 */
export default function VoiceInput({ onTranscript, isTTSEnabled, setTTSEnabled }) {
  const [isListening, setIsListening]   = useState(false);
  const [liveText,    setLiveText]      = useState('');
  const [isSupported, setIsSupported]   = useState(true);
  const recognitionRef                  = useRef(null);

  // ── initialise SpeechRecognition once ──────────────────────────────────────
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognitionAPI();
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.lang            = 'en-US';

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript   = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      setLiveText(finalTranscript || interimTranscript);

      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
        setLiveText('');
        setIsListening(false);
      }
    };

    rec.onerror = (event) => {
      console.error('[VoiceInput] SpeechRecognition error:', event.error);
      setIsListening(false);
      setLiveText('');
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      rec.abort();
    };
  }, [onTranscript]);

  // ── toggle listening ────────────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setLiveText('');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setLiveText('');
      } catch (err) {
        console.error('[VoiceInput] Could not start recognition:', err);
      }
    }
  }, [isListening, isSupported]);

  // ── toggle TTS ──────────────────────────────────────────────────────────────
  const toggleTTS = useCallback(() => {
    const next = !isTTSEnabled;
    setTTSEnabled(next);
    if (!next && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
  }, [isTTSEnabled, setTTSEnabled]);

  // ── unsupported browser fallback ────────────────────────────────────────────
  if (!isSupported) {
    return (
      <div className="flex items-center gap-1 text-xs text-slate-500 px-2">
        <MicOff size={14} />
        <span>Voice not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Live transcript chip */}
      {liveText && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-xs text-[var(--accent)] max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis animate-pulse-slow">
          <Loader2 size={10} className="animate-spin shrink-0" />
          <span className="overflow-hidden text-ellipsis">{liveText}</span>
        </div>
      )}

      {/* Mic toggle button */}
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Stop listening' : 'Start voice input'}
        className={[
          'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 outline-none',
          isListening
            ? 'bg-[var(--danger)]/20 text-[var(--danger)] animate-pulse'
            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200',
        ].join(' ')}
      >
        {isListening ? <MicOff size={15} /> : <Mic size={15} />}
      </button>

      {/* TTS speaker toggle */}
      <button
        type="button"
        onClick={toggleTTS}
        title={isTTSEnabled ? 'Mute AI read-aloud' : 'Enable AI read-aloud'}
        className={[
          'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 outline-none',
          isTTSEnabled
            ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200',
        ].join(' ')}
      >
        {isTTSEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      </button>
    </div>
  );
}
