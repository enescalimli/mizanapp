"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseVoiceChatOptions {
  onTranscript?: (text: string) => void;
  lang?: string;
}

export function useVoiceChat({ onTranscript, lang = "tr-TR" }: UseVoiceChatOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setHasSpeechSupport(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
          setIsListening(false);
        };
        recognition.onresult = (event: any) => {
          const text = event.results[0]?.[0]?.transcript;
          if (text && onTranscript) {
            onTranscript(text.trim());
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lang, onTranscript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        // Eğer o sırada ses çalıyorsa durdur
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          setActiveSpeakingId(null);
        }
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Could not start recognition:", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  }, [isListening]);

  /**
   * Markdown sembollerini temizleyip doğal Türkçe ses üretimi yapar
   */
  const cleanMarkdownForSpeech = (md: string): string => {
    return md
      .replace(/###?\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/`{1,3}.*?`{1,3}/g, "")
      .replace(/[|>#\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const speak = useCallback(
    (text: string, messageId?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      // Eğer aynı mesaj zaten konuşuluyorsa durdur
      if (isSpeaking && activeSpeakingId === messageId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setActiveSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();

      const cleanedText = cleanMarkdownForSpeech(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = lang;
      utterance.rate = 1.05; // Akıcı ve anlaşılır hız
      utterance.pitch = 1.0;

      // Türkçe ses seçimi yapmaya çalış
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find((v) => v.lang.startsWith("tr"));
      if (trVoice) {
        utterance.voice = trVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (messageId) setActiveSpeakingId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveSpeakingId(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking, activeSpeakingId, lang]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    }
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    isSpeaking,
    activeSpeakingId,
    speak,
    stopSpeaking,
    hasSpeechSupport,
  };
}
