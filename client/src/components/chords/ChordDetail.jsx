import { useMemo } from "react";
import FretboardDiagram from "./FretboardDiagram";
import { PROGRESSIONS } from "../../data/chords";

// ═══════════════════════════════════════════════════════════════
//  FretForge — ChordDetail
//  Expanded detail panel for a selected chord
//  Shows: large diagram, finger guide, note names, playing tips,
//  and progressions that include this chord
// ═══════════════════════════════════════════════════════════════

const STRING_NAMES = ["Low E", "A", "D", "G", "B", "High E"];

const STRING_COLORS = [
  "#ff2d6b", "#ff6b2b", "#ffb000", "#00ff9f", "#02d7f2", "#a855f7",
];

const TYPE_COLORS = {
  major: "#ffb000",
  minor: "#02d7f2",
  dominant7: "#ff6b2b",
  minor7: "#a855f7",
  power: "#ff2d6b",
};

const TIER_INFO = {
  1: { label: "Tier 1 · Beginner", desc: "Week 1-2", color: "#00ff9f" },
  2: { label: "Tier 2 · Essential", desc: "Week 2-4", color: "#ffb000" },
  3: { label: "Tier 3 · Intermediate", desc: "Month 2", color: "#ff6b2b" },
  4: { label: "Tier 4 · Advanced", desc: "Month 6+", color: "#ff2d6b" },
};

const FINGER_NAMES = { 0: "—", 1: "Index", 2: "Middle", 3: "Ring", 4: "Pinky" };

export default function ChordDetail({ chord, chordKey, onClose }) {
  const typeColor = TYPE_COLORS[chord.type] || "#94a3b8";
  const tierInfo = TIER_INFO[chord.tier] || { label: "?", desc: "", color: "#94a3b8" };

  // ─── Find progressions that use this chord ─────────────────
  const relatedProgressions = useMemo(() => {
    const results = [];
    for (const [level, progs] of Object.entries(PROGRESSIONS)) {
      for (const prog of progs) {
        // Check if this chord appears in the progression (deduplicated)
        const uniqueChords = [...new Set(prog.chords)];
        if (uniqueChords.includes(chordKey)) {
          results.push({ ...prog, level });
        }
      }
    }
    return results;
  }, [chordKey]);

  // ─── Build the finger-per-string guide ─────────────────────
  const fingerGuide = chord.strings.map((fret, i) => {
    if (fret === -1) return { string: STRING_NAMES[i], action: "Muted", fret: "✕", finger: "—", color: "#475569" };
    if (fret === 0) return { string: STRING_NAMES[i], action: "Open", fret: "0", finger: "—", color: STRING_COLORS[i] };
    return {
      string: STRING_NAMES[i],
      action: `Fret ${fret}`,
      fret: String(fret),
      finger: FINGER_NAMES[chord.fingers[i]] || "—",
      color: STRING_COLORS[i],
    };
  });

  return (
    <div style={styles.panel}>
      {/* ─── Header ──────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.chordName}>
            <span style={{ color: typeColor }}>{chord.short}</span>
            <span style={styles.chordFullName}>{chord.name}</span>
          </h2>
          <div style={styles.badges}>
            <span style={{ ...styles.badge, background: `${typeColor}15`, color: typeColor }}>
              {chord.type.replace("dominant", "dom ")}
            </span>
            <span style={{ ...styles.badge, background: `${tierInfo.color}15`, color: tierInfo.color }}>
              {tierInfo.label}
            </span>
            <span style={styles.badgeMuted}>{tierInfo.desc}</span>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      {/* ─── Main content: diagram + info ────────────────── */}
      <div style={styles.body}>
        {/* Large fretboard diagram */}
        <div style={styles.diagramSection}>
          <div style={styles.diagramContainer}>
            <FretboardDiagram
              chord={chord}
              width={200}
              showFingers
              showNotes
            />
          </div>

          {/* Barre indicator */}
          {chord.barreAt > 0 && (
            <div style={styles.barreTag}>
              <span style={{ color: "#ff2d6b" }}>⚡</span> Barre chord — index finger across fret {chord.barreAt}
            </div>
          )}
        </div>

        {/* Right side: tips + finger guide */}
        <div style={styles.infoSection}>
          {/* Playing tip */}
          <div style={styles.tipCard}>
            <span style={styles.tipIcon}>💡</span>
            <div>
              <span style={styles.tipLabel}>How to Play</span>
              <p style={styles.tipText}>{chord.tips}</p>
            </div>
          </div>

          {/* String-by-string finger guide */}
          <div style={styles.guideCard}>
            <span style={styles.guideTitle}>Finger Guide</span>
            <div style={styles.guideTable}>
              <div style={styles.guideHeaderRow}>
                <span style={styles.guideHeaderCell}>String</span>
                <span style={styles.guideHeaderCell}>Fret</span>
                <span style={styles.guideHeaderCell}>Finger</span>
              </div>
              {fingerGuide.map((row, i) => (
                <div key={i} style={styles.guideRow}>
                  <span style={{ ...styles.guideCell, color: row.color, fontWeight: "600" }}>
                    {row.string}
                  </span>
                  <span style={{ ...styles.guideCell, color: row.fret === "✕" ? "#475569" : "#e2e8f0" }}>
                    {row.fret === "✕" ? "✕ mute" : row.fret === "0" ? "○ open" : `fret ${row.fret}`}
                  </span>
                  <span style={{ ...styles.guideCell, color: "#94a3b8" }}>
                    {row.finger}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes in this chord */}
          <div style={styles.notesCard}>
            <span style={styles.guideTitle}>Notes</span>
            <div style={styles.notesRow}>
              {chord.notes.map((note, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.noteBubble,
                    background: note === "X" ? "#1a2332" : `${STRING_COLORS[i]}15`,
                    color: note === "X" ? "#475569" : STRING_COLORS[i],
                    borderColor: note === "X" ? "#1a233266" : `${STRING_COLORS[i]}33`,
                  }}
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Related Progressions ────────────────────────── */}
      {relatedProgressions.length > 0 && (
        <div style={styles.progressionsSection}>
          <span style={styles.guideTitle}>
            Progressions with {chord.short}
          </span>
          <div style={styles.progGrid}>
            {relatedProgressions.map((prog, i) => (
              <div key={i} style={styles.progCard}>
                <div style={styles.progHeader}>
                  <span style={styles.progName}>{prog.name}</span>
                  <span style={{
                    ...styles.progLevel,
                    color: prog.level === "beginner" ? "#00ff9f"
                      : prog.level === "intermediate" ? "#ffb000" : "#ff2d6b",
                  }}>
                    {prog.level}
                  </span>
                </div>
                <p style={styles.progDesc}>{prog.description}</p>
                <div style={styles.progChords}>
                  {[...new Set(prog.chords)].map((c, j) => (
                    <span
                      key={j}
                      style={{
                        ...styles.progChordBubble,
                        background: c === chordKey ? `${typeColor}22` : "#0d1220",
                        color: c === chordKey ? typeColor : "#94a3b8",
                        borderColor: c === chordKey ? `${typeColor}44` : "#1a233244",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  panel: {
    background: "#0d1220",
    border: "1px solid #1a233266",
    borderRadius: "14px",
    overflow: "hidden",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #1a233244",
  },
  headerLeft: { flex: 1 },
  chordName: {
    margin: "0 0 8px",
    fontSize: "28px",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "700",
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
  },
  chordFullName: {
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#94a3b8",
    fontWeight: "500",
  },
  badges: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  badge: {
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "4px",
    letterSpacing: "0.3px",
  },
  badgeMuted: {
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
  },
  closeBtn: {
    background: "none",
    border: "1px solid #1a233266",
    borderRadius: "6px",
    color: "#94a3b8",
    fontSize: "14px",
    cursor: "pointer",
    padding: "4px 10px",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.2s ease",
  },

  // Body
  body: {
    display: "flex",
    gap: "24px",
    padding: "20px 24px",
    flexWrap: "wrap",
  },
  diagramSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    minWidth: "200px",
  },
  diagramContainer: {
    background: "#111827",
    border: "1px solid #1a233244",
    borderRadius: "10px",
    padding: "12px 16px 8px",
  },
  barreTag: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#94a3b8",
    padding: "6px 12px",
    background: "#ff2d6b11",
    borderRadius: "6px",
    border: "1px solid #ff2d6b22",
  },

  // Info section
  infoSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minWidth: "240px",
  },
  tipCard: {
    display: "flex",
    gap: "12px",
    padding: "14px 16px",
    background: "#111827",
    borderRadius: "8px",
    border: "1px solid #1a233244",
  },
  tipIcon: { fontSize: "18px", flexShrink: 0, marginTop: "2px" },
  tipLabel: {
    display: "block",
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    color: "#ffb000",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  tipText: {
    margin: 0,
    fontSize: "13px",
    color: "#e2e8f0",
    lineHeight: "1.5",
    fontFamily: "'Space Grotesk', sans-serif",
  },

  // Finger guide
  guideCard: {
    padding: "14px 16px",
    background: "#111827",
    borderRadius: "8px",
    border: "1px solid #1a233244",
  },
  guideTitle: {
    display: "block",
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    color: "#475569",
    letterSpacing: "1px",
    marginBottom: "10px",
  },
  guideTable: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  guideHeaderRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    paddingBottom: "6px",
    borderBottom: "1px solid #1a233244",
    marginBottom: "4px",
  },
  guideHeaderCell: {
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    color: "#475569",
    letterSpacing: "0.5px",
  },
  guideRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
  },
  guideCell: {
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  // Notes
  notesCard: {
    padding: "14px 16px",
    background: "#111827",
    borderRadius: "8px",
    border: "1px solid #1a233244",
  },
  notesRow: {
    display: "flex",
    gap: "6px",
  },
  noteBubble: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid",
  },

  // Progressions
  progressionsSection: {
    padding: "16px 24px 20px",
    borderTop: "1px solid #1a233244",
  },
  progGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "10px",
  },
  progCard: {
    padding: "12px 14px",
    background: "#111827",
    borderRadius: "8px",
    border: "1px solid #1a233244",
  },
  progHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  progName: {
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
  },
  progLevel: {
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  progDesc: {
    margin: "0 0 8px",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
    lineHeight: "1.4",
  },
  progChords: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
  },
  progChordBubble: {
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "4px",
    border: "1px solid",
  },
};
