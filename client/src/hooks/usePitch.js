import { useState, useRef, useCallback, useEffect } from "react";
import { frequencyToNote } from "../data/chords";

// ═══════════════════════════════════════════════════════════════
//  FretForge — usePitch Hook
//  Real-time pitch detection from microphone audio
//  Uses autocorrelation for single-note identification
//  (Tuner mode, scale practice, single note validation)
// ═══════════════════════════════════════════════════════════════

// Minimum volume threshold to start detecting
// — prevents false detections from background noise
const CLARITY_THRESHOLD = 0.85; // 0-1, higher = more strict
const VOLUME_THRESHOLD = -40; // dBFS, adjust based on mic sensitivity

export function usePitch(audioContext, analyser) {
  const [detectedNote, setDetectedNote] = useState(null);
  const [detectedFreq, setDetectedFreq] = useState(null);
  const [clarity, setClarity] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const rafRef = useRef(null);

  // ─── Autocorrelation-based pitch detection ────────────────
  // This is a simplified version of the McLeod Pitch Method
  // The pitchy library uses a more sophisticated version
  // For now, we use the AnalyserNode's built-in FFT approach
  const detectPitch = useCallback(() => {
    if (!analyser?.current) return;

    const analyserNode = analyser.current;
    const bufferLength = analyserNode.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserNode.getFloatTimeDomainData(buffer);

    // ─── Step 1: Check if signal is loud enough ───────────
    // Calculate RMS (root mean square) as a volume indicator
    let rms = 0;
    for (let i = 0; i < bufferLength; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / bufferLength);
    const dbFS = 20 * Math.log10(rms);

    // If the signal is too quiet, don't try to detect pitch
    if (dbFS < VOLUME_THRESHOLD) {
      setDetectedNote(null);
      setDetectedFreq(null);
      setClarity(0);
      return;
    }

    // ─── Step 2: Autocorrelation ──────────────────────────
    // Compare the signal with time-shifted versions of itself
    // The lag where correlation peaks = the fundamental period
    const sampleRate = audioContext.current?.sampleRate || 44100;
    const correlations = new Float32Array(bufferLength);

    // Only search for frequencies in the guitar range:
    // Low E2 = 82Hz → period ~537 samples at 44100Hz
    // High E6 = 1319Hz → period ~33 samples
    const minPeriod = Math.floor(sampleRate / 1400); // ~31 samples
    const maxPeriod = Math.floor(sampleRate / 70); // ~630 samples

    let bestCorrelation = -1;
    let bestPeriod = 0;

    for (let lag = minPeriod; lag < maxPeriod && lag < bufferLength; lag++) {
      let correlation = 0;
      let norm1 = 0;
      let norm2 = 0;

      // Normalized cross-correlation for this lag value
      for (let i = 0; i < bufferLength - lag; i++) {
        correlation += buffer[i] * buffer[i + lag];
        norm1 += buffer[i] * buffer[i];
        norm2 += buffer[i + lag] * buffer[i + lag];
      }

      // Normalize to get a value between -1 and 1
      const normFactor = Math.sqrt(norm1 * norm2);
      if (normFactor > 0) {
        correlation /= normFactor;
      }
      correlations[lag] = correlation;

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = lag;
      }
    }

    // ─── Step 3: Refine with parabolic interpolation ──────
    // The true peak is usually between integer sample positions
    // Use the three points around the peak for sub-sample accuracy
    let refinedPeriod = bestPeriod;
    if (bestPeriod > 0 && bestPeriod < bufferLength - 1) {
      const y0 = correlations[bestPeriod - 1] || 0;
      const y1 = correlations[bestPeriod];
      const y2 = correlations[bestPeriod + 1] || 0;
      const shift = (y0 - y2) / (2 * (y0 - 2 * y1 + y2));
      if (isFinite(shift)) {
        refinedPeriod = bestPeriod + shift;
      }
    }

    // ─── Step 4: Convert period to frequency and note ─────
    const frequency = sampleRate / refinedPeriod;

    setClarity(bestCorrelation);

    // Only report if we're confident in the detection
    if (bestCorrelation > CLARITY_THRESHOLD && frequency > 70 && frequency < 1400) {
      const noteInfo = frequencyToNote(frequency);
      setDetectedFreq(frequency);
      setDetectedNote(noteInfo);
    } else {
      setDetectedNote(null);
      setDetectedFreq(null);
    }
  }, [audioContext, analyser]);

  // ─── Start/stop the detection loop ────────────────────────
  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ─── Animation frame loop for continuous detection ────────
  useEffect(() => {
    if (!isActive) return;

    const loop = () => {
      detectPitch();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive, detectPitch]);

  return {
    detectedNote, // { note: "E", octave: 2, cents: -3, freq: 82.1 } or null
    detectedFreq, // raw frequency in Hz
    clarity, // 0-1, how confident the detection is
    isActive,
    start,
    stop,
  };
}
