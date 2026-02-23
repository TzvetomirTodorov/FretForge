import { useState, useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  FretForge — useMetronome Hook
//  Precise BPM-based metronome using Web Audio API scheduling
//  Why not just setInterval? JavaScript timers drift ~10-50ms,
//  which is unacceptable for musical timing. We use the
//  AudioContext's clock which is sample-accurate.
// ═══════════════════════════════════════════════════════════════

export function useMetronome() {
  const [bpm, setBpm] = useState(80); // Default 80 BPM — good for beginners
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4); // 4/4 time

  const audioContextRef = useRef(null);
  const timerRef = useRef(null);
  const beatRef = useRef(0);

  // ─── Create click sound using oscillator ──────────────────
  // Much better than loading an audio file — zero latency
  const playClick = useCallback((time, isDownbeat) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Downbeat (beat 1) is higher pitched and louder
    // This helps you feel the start of each measure
    osc.frequency.value = isDownbeat ? 1000 : 700;
    gain.gain.value = isDownbeat ? 0.5 : 0.3;

    // Very short click: ramp down over 30ms for a crisp sound
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    osc.start(time);
    osc.stop(time + 0.03);
  }, []);

  // ─── Start the metronome ──────────────────────────────────
  const start = useCallback(() => {
    // Create a fresh AudioContext (browser requires user gesture first)
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = ctx;
    beatRef.current = 0;

    const secondsPerBeat = 60.0 / bpm;

    // Schedule beats using AudioContext timing for accuracy
    // We look ahead 100ms and schedule any beats in that window
    let nextBeatTime = ctx.currentTime + 0.1; // Small initial delay

    const scheduler = () => {
      // Schedule all beats within the next 100ms lookahead window
      while (nextBeatTime < ctx.currentTime + 0.1) {
        const isDownbeat = beatRef.current % beatsPerMeasure === 0;
        playClick(nextBeatTime, isDownbeat);

        // Update the visual beat indicator
        // We use setTimeout here because the UI doesn't need sample-accurate timing
        const beatToShow = beatRef.current % beatsPerMeasure;
        const delay = (nextBeatTime - ctx.currentTime) * 1000;
        setTimeout(() => setCurrentBeat(beatToShow), Math.max(0, delay));

        nextBeatTime += secondsPerBeat;
        beatRef.current++;
      }

      timerRef.current = setTimeout(scheduler, 25); // Check every 25ms
    };

    scheduler();
    setIsPlaying(true);
  }, [bpm, beatsPerMeasure, playClick]);

  // ─── Stop the metronome ───────────────────────────────────
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    beatRef.current = 0;
    setCurrentBeat(0);
    setIsPlaying(false);
  }, []);

  // ─── Clean up on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // ─── Restart if BPM changes while playing ─────────────────
  useEffect(() => {
    if (isPlaying) {
      stop();
      // Small delay to let cleanup finish before restarting
      setTimeout(start, 50);
    }
  }, [bpm]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    bpm,
    setBpm,
    isPlaying,
    currentBeat, // 0 to beatsPerMeasure-1
    beatsPerMeasure,
    setBeatsPerMeasure,
    start,
    stop,
    toggle: isPlaying ? stop : start,
  };
}
