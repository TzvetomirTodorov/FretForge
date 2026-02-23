import FretboardDiagram from "./FretboardDiagram";

// ═══════════════════════════════════════════════════════════════
//  FretForge — ChordCard
//  Compact card for the chord library grid view
//  Shows: mini fretboard diagram, chord name, type badge, tier
//  Clickable — parent handles what happens on click (detail view)
// ═══════════════════════════════════════════════════════════════

// Type badge colors for visual differentiation
const TYPE_COLORS = {
  major: "#ffb000",
  minor: "#02d7f2",
  dominant7: "#ff6b2b",
  minor7: "#a855f7",
  power: "#ff2d6b",
};

// Tier labels and colors
const TIER_INFO = {
  1: { label: "Beginner", color: "#00ff9f" },
  2: { label: "Essential", color: "#ffb000" },
  3: { label: "Intermediate", color: "#ff6b2b" },
  4: { label: "Advanced", color: "#ff2d6b" },
};

export default function ChordCard({ chord, chordKey, onClick, isSelected = false }) {
  const typeColor = TYPE_COLORS[chord.type] || "#94a3b8";
  const tierInfo = TIER_INFO[chord.tier] || { label: "?", color: "#94a3b8" };

  return (
    <button
      onClick={() => onClick(chordKey)}
      style={{
        ...styles.card,
        borderColor: isSelected ? typeColor : "#1a233244",
        background: isSelected ? `${typeColor}08` : "#111827",
        boxShadow: isSelected ? `0 0 20px ${typeColor}15` : "none",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Tier indicator dot */}
      <div style={styles.tierRow}>
        <div style={{ ...styles.tierDot, background: tierInfo.color }} />
        <span style={{ ...styles.tierLabel, color: tierInfo.color }}>
          {tierInfo.label}
        </span>
      </div>

      {/* Mini fretboard diagram */}
      <div style={styles.diagramWrapper}>
        <FretboardDiagram chord={chord} width={120} compact showFingers={false} />
      </div>

      {/* Chord name */}
      <div style={styles.nameRow}>
        <span style={styles.chordShort}>{chord.short}</span>
        <span style={styles.chordName}>{chord.name}</span>
      </div>

      {/* Type badge */}
      <div style={{ ...styles.typeBadge, background: `${typeColor}15`, color: typeColor }}>
        {chord.type.replace("dominant", "dom ")}
      </div>
    </button>
  );
}

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "14px 10px 12px",
    border: "1px solid",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    width: "100%",
    textAlign: "center",
    fontFamily: "inherit",
    // Reset button styles
    background: "#111827",
    color: "inherit",
    outline: "none",
  },
  tierRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    alignSelf: "flex-start",
    marginBottom: "2px",
  },
  tierDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
  },
  tierLabel: {
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  diagramWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  nameRow: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },
  chordShort: {
    fontSize: "20px",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    lineHeight: "1.1",
  },
  chordName: {
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
  },
  typeBadge: {
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "4px",
    letterSpacing: "0.3px",
    marginTop: "2px",
  },
};
