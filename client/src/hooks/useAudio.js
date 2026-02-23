import { useState, useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  FretForge — useAudio Hook
//  Manages microphone access, AudioContext, and AnalyserNode
//  This is the foundation layer that other audio hooks build on
// ═══════════════════════════════════════════════════════════════

export function useAudio() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Refs persist across renders without triggering re-renders
  // — important because audio processing runs at 60fps+
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  // ─── Request microphone access and set up audio pipeline ──
  const startListening = useCallback(async () => {
    try {
      setError(null);

      // Request microphone with raw audio settings
      // CRITICAL: disable all browser audio processing
      // — echo cancellation and noise suppression destroy pitch accuracy
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          // 44100Hz is standard and gives us good frequency resolution
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;
      setHasPermission(true);

      // Create the AudioContext — the central hub for all audio processing
      // Every node (analyser, source, worklet) connects through this
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 44100,
      });
      audioContextRef.current = audioContext;

      // AnalyserNode provides real-time frequency and waveform data
      // fftSize of 4096 gives us 2048 frequency bins — enough resolution
      // to distinguish individual guitar notes (lowest E2 = 82Hz)
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8; // Slight smoothing reduces noise
      analyserRef.current = analyser;

      // Connect the pipeline: microphone → analyser (no output to speakers)
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      // NOTE: We deliberately do NOT connect analyser to audioContext.destination
      // — that would play the mic input through the speakers and create feedback

      setIsListening(true);
    } catch (err) {
      // Common failure: user denies microphone permission
      if (err.name === "NotAllowedError") {
        setError("Microphone access denied. FretForge needs your mic to hear your guitar.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Connect a mic or use your device's built-in mic.");
      } else {
        setError(`Audio error: ${err.message}`);
      }
      setIsListening(false);
    }
  }, []);

  // ─── Clean up: stop mic, close AudioContext ───────────────
  const stopListening = useCallback(() => {
    // Stop all microphone tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Disconnect and close audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
  }, []);

  // ─── Clean up on component unmount ────────────────────────
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // ─── Helper: get current frequency data from analyser ─────
  // Returns a Float32Array of frequency magnitudes (in dB)
  // Other hooks (usePitch, useChordDetection) consume this data
  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current) return null;
    const data = new Float32Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getFloatFrequencyData(data);
    return data;
  }, []);

  // ─── Helper: get time-domain waveform data ────────────────
  // Used for waveform visualization and pitch detection algorithms
  const getTimeDomainData = useCallback(() => {
    if (!analyserRef.current) return null;
    const data = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(data);
    return data;
  }, []);

  return {
    isListening,
    error,
    hasPermission,
    startListening,
    stopListening,
    getFrequencyData,
    getTimeDomainData,
    // Expose refs for advanced usage by other hooks
    audioContext: audioContextRef,
    analyser: analyserRef,
  };
}
