import { useCallback, useState, useEffect, useRef } from "react";
import { useAudio } from "../../hooks/useAudio";
import { usePitch } from "../../hooks/usePitch";
import TuningMeter from "../../components/audio/TuningMeter";
import StringDisplay from "../../components/audio/StringDisplay";

// ═══════════════════════════════════════════════════════════════
//  FretForge — Tuner Page
//  Full chromatic guitar tuner using the Web Audio API
//  Composes: useAudio → usePitch → TuningMeter + StringDisplay
//  This is the first feature that proves the audio pipeline works
// ═══════════════════════════════════════════════════════════════

export default function TunerPage() {
  // ─── Audio pipeline ─────────────────────────────────────────
  const {
    isListening,
    error: audioError,
    startListening,
    stopListening,
    audioContext,
    analyser,
  } = useAudio();

  const {
    detectedNote,
    detectedFreq,
    clarity,
    isActive: pitchActive,
    start: startPitch,
    stop: stopPitch,
  } = usePitch(audioContext, analyser);

  // ─── Smoothed values for display (reduces jitter) ──────────
  const [displayNote, setDisplayNote] = useState(null);
  const [displayCents, setDisplayCents] = useState(0);
  const [displayFreq, setDisplayFreq] = useState(null);
  const lastNoteTime = useRef(0);
  const noteHoldBuffer = useRef(null); // Prevents rapid note flickering

  // Smooth the detected note: require a note to be stable for 80ms
  // before displaying it, so quick harmonics/noise don't cause flickering
  useEffect(() => {
    if (!detectedNote) {
      // If no note detected for 400ms, clear the display
      const timeout = setTimeout(() => {
        setDisplayNote(null);
        setDisplayCents(0);
        setDisplayFreq(null);
      }, 400);
      return () => clearTimeout(timeout);
    }

    const noteKey = `${detectedNote.note}${detectedNote.octave}`;
    const now = Date.now();

    // If this is the same note as the buffer, update cents smoothly
    if (noteHoldBuffer.current === noteKey) {
      setDisplayNote(detectedNote);
      setDisplayCents(detectedNote.cents);
      setDisplayFreq(detectedFreq);
    } else {
      // New note detected — wait 80ms of stability before switching
      noteHoldBuffer.current = noteKey;
      lastNoteTime.current = now;

      const timeout = setTimeout(() => {
        if (noteHoldBuffer.current === noteKey) {
          setDisplayNote(detectedNote);
          setDisplayCents(detectedNote.cents);
          setDisplayFreq(detectedFreq);
        }
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [detectedNote, detectedFreq]);

  // ─── Toggle microphone ──────────────────────────────────────
  const handleToggle = useCallback(async () => {
    if (isListening) {
      stopPitch();
      stopListening();
    } else {
      await startListening();
      // Small delay to let AudioContext initialize before starting pitch detection
      setTimeout(() => startPitch(), 100);
    }
  }, [isListening, startListening, stopListening, startPitch, stopPitch]);

  // ─── Frequency display formatter ───────────────────────────
  const freqDisplay = displayFreq ? `${displayFreq.toFixed(1)} Hz` : "— Hz";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Chromatic Tuner</h2>
          <p style={styles.subtitle}>
            {isListening
              ? "Listening — play an open string"
              : "Click start to begin tuning your guitar"}
          </p>
        </div>

        {/* Error display */}
        {audioError && (
          <div style={styles.errorCard}>
            <span style={styles.errorIcon}>⚠</span>
            <span>{audioError}</span>
          </div>
        )}

        {/* Main tuner area */}
        <div style={styles.tunerArea}>
          {/* The SVG gauge */}
          <TuningMeter
            cents={displayCents}
            isActive={isListening}
            note={displayNote}
          />

          {/* Frequency and clarity readout */}
          <div style={styles.readout}>
            <div style={styles.readoutItem}>
              <span style={styles.readoutLabel}>FREQ</span>
              <span style={styles.readoutValue}>{freqDisplay}</span>
            </div>
            <div style={styles.readoutDivider} />
            <div style={styles.readoutItem}>
              <span style={styles.readoutLabel}>CLARITY</span>
              <span style={styles.readoutValue}>
                {isListening && displayNote
                  ? `${Math.round(clarity * 100)}%`
                  : "—"}
              </span>
            </div>
            <div style={styles.readoutDivider} />
            <div style={styles.readoutItem}>
              <span style={styles.readoutLabel}>STATUS</span>
              <span
                style={{
                  ...styles.readoutValue,
                  color: isListening
                    ? "#00ff9f"
                    : "#475569",
                }}
              >
                {isListening ? "● LIVE" : "○ OFF"}
              </span>
            </div>
          </div>

          {/* Start/Stop button */}
          <button
            onClick={handleToggle}
            style={{
              ...styles.toggleButton,
              background: isListening
                ? "linear-gradient(135deg, #ff2d6b, #ff6b2b)"
                : "linear-gradient(135deg, #ff6b2b, #ffb000)",
              boxShadow: isListening
                ? "0 4px 20px #ff2d6b33"
                : "0 4px 20px #ff6b2b33",
            }}
          >
            {isListening ? "⏹ Stop Listening" : "🎵 Start Tuning"}
          </button>
        </div>

        {/* String display */}
        <div style={styles.stringsSection}>
          <StringDisplay
            detectedFreq={displayFreq}
            isActive={isListening}
          />
        </div>

        {/* How to use */}
        <div style={styles.tipsCard}>
          <h3 style={styles.tipsTitle}>How to tune your guitar</h3>
          <div style={styles.tipsContent}>
            <p style={styles.tip}>
              <span style={styles.tipNumber}>1</span>
              Click "Start Tuning" and allow microphone access when prompted.
            </p>
            <p style={styles.tip}>
              <span style={styles.tipNumber}>2</span>
              Play a single open string and let it ring. The tuner will detect
              the note and show you how far off you are in cents.
            </p>
            <p style={styles.tip}>
              <span style={styles.tipNumber}>3</span>
              Adjust the tuning peg until the needle centers and turns
              {" "}<span style={{ color: "#00ff9f", fontWeight: 600 }}>green</span>.
              Within ±5 cents is considered in tune.
            </p>
            <p style={styles.tip}>
              <span style={styles.tipNumber}>4</span>
              Work from the thickest string (6th, Low E) to the thinnest (1st, High E).
              Remember: Easter Bunnies Get Drunk After Easter!
            </p>
          </div>
        </div>

        {/* Reference pitches */}
        <div style={styles.referenceCard}>
          <div style={styles.referenceHeader}>
            <span style={styles.referenceTitle}>Standard Tuning Reference (A440)</span>
          </div>
          <div style={styles.referenceContent}>
            <span style={styles.referenceNote}>
              6th → E2 (82.41 Hz) &nbsp;·&nbsp; 5th → A2 (110.0 Hz) &nbsp;·&nbsp;
              4th → D3 (146.8 Hz) &nbsp;·&nbsp; 3rd → G3 (196.0 Hz) &nbsp;·&nbsp;
              2nd → B3 (247.0 Hz) &nbsp;·&nbsp; 1st → E4 (329.6 Hz)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px 0 64px",
  },
  container: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "0 20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#94a3b8",
    margin: 0,
  },
  errorCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    background: "#ff2d6b11",
    border: "1px solid #ff2d6b44",
    borderRadius: "8px",
    color: "#ff2d6b",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    marginBottom: "20px",
  },
  errorIcon: {
    fontSize: "18px",
  },
  tunerArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
  },
  readout: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "12px 24px",
    background: "#111827",
    border: "1px solid #1a233266",
    borderRadius: "8px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  readoutItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  readoutLabel: {
    fontSize: "9px",
    fontWeight: "600",
    color: "#475569",
    letterSpacing: "1.5px",
  },
  readoutValue: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#94a3b8",
    minWidth: "70px",
    textAlign: "center",
  },
  readoutDivider: {
    width: "1px",
    height: "28px",
    background: "#1a2332",
  },
  toggleButton: {
    padding: "14px 32px",
    borderRadius: "8px",
    border: "none",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "15px",
    fontWeight: "700",
    color: "#0a0e17",
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "0.3px",
  },
  stringsSection: {
    marginBottom: "32px",
  },
  tipsCard: {
    background: "#111827",
    border: "1px solid #1a233266",
    borderRadius: "8px",
    padding: "20px 24px",
    marginBottom: "16px",
  },
  tipsTitle: {
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: "0 0 14px",
  },
  tipsContent: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  tip: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "13px",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#94a3b8",
    lineHeight: "1.5",
    margin: 0,
  },
  tipNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#ff6b2b22",
    color: "#ff6b2b",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "700",
    flexShrink: 0,
  },
  referenceCard: {
    background: "#111827",
    border: "1px solid #1a233266",
    borderRadius: "8px",
    overflow: "hidden",
  },
  referenceHeader: {
    padding: "10px 16px",
    borderBottom: "1px solid #1a233266",
  },
  referenceTitle: {
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    color: "#475569",
    letterSpacing: "1px",
  },
  referenceContent: {
    padding: "12px 16px",
  },
  referenceNote: {
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#94a3b8",
    lineHeight: "1.8",
  },
};
