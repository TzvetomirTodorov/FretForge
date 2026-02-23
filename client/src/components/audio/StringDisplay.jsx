import { useMemo } from "react";
import { STANDARD_TUNING } from "../../data/chords";

// ═══════════════════════════════════════════════════════════════
//  FretForge — StringDisplay
//  Shows all 6 guitar strings in standard tuning
//  Highlights the string closest to the detected frequency
//  Color-coded by the FretForge string identity system
// ═══════════════════════════════════════════════════════════════

// How many cents away from a string's target before we stop matching it
const STRING_MATCH_THRESHOLD = 200; // cents (generous — ~2 semitones)

// Resolved color values for inline styles (CSS vars don't work in all contexts)
const STRING_COLORS = {
  "E-low": "#ff2d6b",
  A: "#ff6b2b",
  D: "#ffb000",
  G: "#00ff9f",
  B: "#02d7f2",
  "E-high": "#a855f7",
};

const COLOR_MAP = [
  STRING_COLORS["E-low"], // string 6 — Low E
  STRING_COLORS["A"],     // string 5 — A
  STRING_COLORS["D"],     // string 4 — D
  STRING_COLORS["G"],     // string 3 — G
  STRING_COLORS["B"],     // string 2 — B
  STRING_COLORS["E-high"],// string 1 — High E
];

export default function StringDisplay({ detectedFreq = null, isActive = false }) {
  // ─── Find the nearest string to the detected frequency ────
  const nearestString = useMemo(() => {
    if (!isActive || !detectedFreq || detectedFreq <= 0) return null;

    let closest = null;
    let minCents = Infinity;

    STANDARD_TUNING.forEach((s, index) => {
      // Calculate cents difference between detected freq and this string's target
      const cents = 1200 * Math.log2(detectedFreq / s.freq);
      const absCents = Math.abs(cents);

      if (absCents < minCents && absCents < STRING_MATCH_THRESHOLD) {
        minCents = absCents;
        closest = { ...s, index, cents: Math.round(cents) };
      }
    });

    return closest;
  }, [detectedFreq, isActive]);

  return (
    <div style={styles.container}>
      <div style={styles.label}>
        <span style={styles.labelText}>STRINGS</span>
        <span style={styles.labelHint}>
          {nearestString
            ? `Nearest: ${nearestString.name}`
            : isActive
            ? "Play an open string"
            : ""}
        </span>
      </div>

      <div style={styles.stringsRow}>
        {STANDARD_TUNING.map((string, index) => {
          const isMatched = nearestString?.index === index;
          const color = COLOR_MAP[index];
          const centsOff = isMatched ? nearestString.cents : null;

          // Determine tuning indicator for matched string
          let tuningIndicator = "";
          if (isMatched && centsOff !== null) {
            const abs = Math.abs(centsOff);
            if (abs <= 5) tuningIndicator = "✓";
            else if (centsOff < 0) tuningIndicator = "↑";
            else tuningIndicator = "↓";
          }

          return (
            <div
              key={string.string}
              style={{
                ...styles.stringCard,
                borderColor: isMatched ? color : "#1a233244",
                background: isMatched
                  ? `${color}11`
                  : "#111827",
                boxShadow: isMatched
                  ? `0 0 20px ${color}22, 0 0 4px ${color}33`
                  : "none",
                transform: isMatched ? "scale(1.08)" : "scale(1)",
              }}
            >
              {/* String number circle */}
              <div
                style={{
                  ...styles.stringCircle,
                  background: isMatched ? color : "#1a2332",
                  color: isMatched ? "#0a0e17" : "#475569",
                  boxShadow: isMatched ? `0 0 10px ${color}44` : "none",
                }}
              >
                {string.string}
              </div>

              {/* Note name */}
              <div
                style={{
                  ...styles.noteName,
                  color: isMatched ? color : "#94a3b8",
                }}
              >
                {string.note}
              </div>

              {/* String label */}
              <div style={styles.stringLabel}>
                {string.name}
              </div>

              {/* Target frequency */}
              <div style={styles.freq}>
                {string.freq.toFixed(1)} Hz
              </div>

              {/* Tuning indicator (only on matched string) */}
              {isMatched && (
                <div
                  style={{
                    ...styles.tuningIndicator,
                    color:
                      tuningIndicator === "✓"
                        ? "#00ff9f"
                        : "#ffb000",
                  }}
                >
                  {tuningIndicator}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Visual string lines (decorative) */}
      <div style={styles.stringLines}>
        {STANDARD_TUNING.map((string, index) => {
          const isMatched = nearestString?.index === index;
          const color = COLOR_MAP[index];
          // String thickness: low E is thickest, high E is thinnest
          const thickness = 6 - index; // 6px for low E, 1px for high E

          return (
            <div
              key={`line-${string.string}`}
              style={{
                height: `${thickness}px`,
                background: isMatched
                  ? `linear-gradient(90deg, transparent, ${color}, transparent)`
                  : `linear-gradient(90deg, transparent, ${color}33, transparent)`,
                borderRadius: "2px",
                transition: "all 0.2s ease",
                opacity: isMatched ? 1 : 0.4,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
  label: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    padding: "0 4px",
  },
  labelText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: "600",
    color: "#475569",
    letterSpacing: "2px",
  },
  labelHint: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#94a3b8",
  },
  stringsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "8px",
    marginBottom: "16px",
  },
  stringCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "12px 6px",
    borderRadius: "8px",
    border: "1px solid",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    position: "relative",
    minHeight: "110px",
  },
  stringCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },
  noteName: {
    fontSize: "20px",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    transition: "color 0.2s ease",
    lineHeight: "1",
  },
  stringLabel: {
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
    letterSpacing: "0.5px",
  },
  freq: {
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
    opacity: "0.7",
  },
  tuningIndicator: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    fontSize: "14px",
    fontWeight: "700",
    transition: "color 0.2s ease",
  },
  stringLines: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "12px 0",
  },
};
