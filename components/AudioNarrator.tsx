"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from "lucide-react";

interface AudioNarratorProps {
  narrationText?: string;
}

export const AudioNarrator: React.FC<AudioNarratorProps> = ({
  narrationText = (
    "Welcome to ParaliWatch, Project 007. An environmental intelligence platform tracking Punjab's " +
    "paddy-residue burning season using NASA VIIRS satellite observations and Open-Meteo atmospheric covariates. " +
    "Explore real-time fire detections, historical seasonal comparisons, and honest next-day statistical forecasts."
  ),
}) => {
  const [supported, setSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
  }, []);

  const handlePlay = () => {
    if (!supported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = "en-IN"; // Prefer Indian English accent if available, fallback natural

    // Attempt to pick a smooth English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("en-IN") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-US")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (!supported) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2 p-1.5 px-3 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur text-xs text-[var(--text-secondary)] shadow-sm">
      <div className="flex items-center gap-1.5 text-[var(--accent-green)] font-medium">
        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`} />
        <span className="hidden md:inline">Voice Briefing</span>
      </div>

      <div className="h-3 w-px bg-[var(--border-color)] mx-1" />

      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition"
          title="Play environmental briefing"
        >
          <Play className="w-3 h-3 text-[var(--accent-green)]" />
          <span>{isPaused ? "Resume" : "Listen"}</span>
        </button>
      ) : (
        <button
          onClick={handlePause}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition"
          title="Pause briefing"
        >
          <Pause className="w-3 h-3 text-[var(--accent-amber)]" />
          <span>Pause</span>
        </button>
      )}

      {(isPlaying || isPaused) && (
        <button
          onClick={handleStop}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent-terracotta)] transition"
          title="Stop briefing"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
