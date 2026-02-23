import { useState, useMemo, useCallback } from "react";
import { CHORD_LIBRARY, PROGRESSIONS } from "../data/chords";
import ChordCard from "../components/chords/ChordCard";
import ChordDetail from "../components/chords/ChordDetail";

// ═══════════════════════════════════════════════════════════════
//  FretForge — ChordsPage
//  Full chord library browser with:
//  - Tier filtering (1-4 difficulty progression)
//  - Type filtering (major, minor, dom7, min7, power)
//  - Search by name
//  - Grid of interactive ChordCard components
//  - Expandable ChordDetail panel for selected chord
//  - Curated progressions section organized by difficulty
// ═══════════════════════════════════════════════════════════════

// All chord entries as [key, chord] pairs for easy filtering
const ALL_CHORDS = Object.entries(CHORD_LIBRARY);

// Filter option definitions
const TIER_FILTERS = [
  { value: 0, label: "All Tiers" },
  { value: 1, label: "Tier 1 · Beginner", color: "#00ff9f" },
  { value: 2, label: "Tier 2 · Essential", color: "#ffb000" },
  { value: 3, label: "Tier 3 · Intermediate", color: "#ff6b2b" },
  { value: 4, label: "Tier 4 · Advanced", color: "#ff2d6b" },
];

const TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "major", label: "Major", color: "#ffb000" },
  { value: "minor", label: "Minor", color: "#02d7f2" },
  { value: "dominant7", label: "Dom 7", color: "#ff6b2b" },
  { value: "minor7", label: "Min 7", color: "#a855f7" },
  { value: "power", label: "Power", color: "#ff2d6b" },
];

const LEVEL_COLORS = {
  beginner: "#00ff9f",
  intermediate: "#ffb000",
  advanced: "#ff2d6b",
};

export default function ChordsPage() {
  const [selectedTier, setSelectedTier] = useState(0);
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedChord, setSelectedChord] = useState(null);
  const [activeProgLevel, setActiveProgLevel] = useState("beginner");

  // ─── Filter the chord library ──────────────────────────────
  const filteredChords = useMemo(() => {
    return ALL_CHORDS.filter(([key, chord]) => {
      // Tier filter
      if (selectedTier > 0 && chord.tier !== selectedTier) return false;
      // Type filter
      if (selectedType !== "all" && chord.type !== selectedType) return false;
      // Search filter (matches short name, full name, or type)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const searchable = `${key} ${chord.name} ${chord.short} ${chord.type}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [selectedTier, selectedType, search]);

  // ─── Handle chord selection ────────────────────────────────
  const handleChordClick = useCallback((key) => {
    setSelectedChord((prev) => (prev === key ? null : key));
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedChord(null);
  }, []);

  // ─── Count chords per filter for the badges ────────────────
  const chordCounts = useMemo(() => {
    const tiers = {};
    const types = {};
    for (const [, chord] of ALL_CHORDS) {
      tiers[chord.tier] = (tiers[chord.tier] || 0) + 1;
      types[chord.type] = (types[chord.type] || 0) + 1;
    }
    return { tiers, types, total: ALL_CHORDS.length };
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ─── Page Header ──────────────────────────────── */}
        <div style={styles.header}>
          <h1 style={styles.title}>🤘 Chord Library</h1>
          <p style={styles.subtitle}>
            {chordCounts.total} chords across 4 difficulty tiers — from your first Em to barre chords and power chords.
            Click any chord to see the full finger guide, notes, and related progressions.
          </p>
        </div>

        {/* ─── Filters Bar ──────────────────────────────── */}
        <div style={styles.filtersBar}>
          {/* Search input */}
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chords..."
              style={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={styles.clearBtn}>✕</button>
            )}
          </div>

          {/* Tier filter pills */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>TIER</span>
            <div style={styles.pills}>
              {TIER_FILTERS.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => setSelectedTier(tier.value)}
                  style={{
                    ...styles.pill,
                    ...(selectedTier === tier.value ? {
                      background: tier.color ? `${tier.color}22` : "#e2e8f011",
                      color: tier.color || "#e2e8f0",
                      borderColor: tier.color ? `${tier.color}44` : "#e2e8f033",
                    } : {}),
                  }}
                >
                  {tier.label}
                  {tier.value > 0 && (
                    <span style={styles.pillCount}>{chordCounts.tiers[tier.value] || 0}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter pills */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>TYPE</span>
            <div style={styles.pills}>
              {TYPE_FILTERS.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  style={{
                    ...styles.pill,
                    ...(selectedType === type.value ? {
                      background: type.color ? `${type.color}22` : "#e2e8f011",
                      color: type.color || "#e2e8f0",
                      borderColor: type.color ? `${type.color}44` : "#e2e8f033",
                    } : {}),
                  }}
                >
                  {type.label}
                  {type.value !== "all" && (
                    <span style={styles.pillCount}>{chordCounts.types[type.value] || 0}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Results count ────────────────────────────── */}
        <div style={styles.resultsBar}>
          <span style={styles.resultsCount}>
            {filteredChords.length} chord{filteredChords.length !== 1 ? "s" : ""}
            {(selectedTier > 0 || selectedType !== "all" || search) && " matching"}
          </span>
          {(selectedTier > 0 || selectedType !== "all" || search) && (
            <button
              onClick={() => { setSelectedTier(0); setSelectedType("all"); setSearch(""); }}
              style={styles.clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ─── Selected Chord Detail Panel ──────────────── */}
        {selectedChord && CHORD_LIBRARY[selectedChord] && (
          <div style={styles.detailWrapper}>
            <ChordDetail
              chord={CHORD_LIBRARY[selectedChord]}
              chordKey={selectedChord}
              onClose={handleCloseDetail}
            />
          </div>
        )}

        {/* ─── Chord Grid ───────────────────────────────── */}
        {filteredChords.length > 0 ? (
          <div style={styles.grid}>
            {filteredChords.map(([key, chord]) => (
              <ChordCard
                key={key}
                chord={chord}
                chordKey={key}
                onClick={handleChordClick}
                isSelected={selectedChord === key}
              />
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <span style={{ fontSize: "32px" }}>🎸</span>
            <p style={styles.emptyText}>No chords match your filters</p>
            <button
              onClick={() => { setSelectedTier(0); setSelectedType("all"); setSearch(""); }}
              style={styles.emptyReset}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ─── Progressions Section ─────────────────────── */}
        <div style={styles.progsSection}>
          <h2 style={styles.progsTitle}>🎵 Chord Progressions</h2>
          <p style={styles.progsSubtitle}>
            Practice these common chord sequences to build muscle memory for real songs.
            Each progression is designed for a specific skill level.
          </p>

          {/* Level tabs */}
          <div style={styles.progsTabs}>
            {Object.keys(PROGRESSIONS).map((level) => (
              <button
                key={level}
                onClick={() => setActiveProgLevel(level)}
                style={{
                  ...styles.progsTab,
                  ...(activeProgLevel === level ? {
                    background: `${LEVEL_COLORS[level]}15`,
                    color: LEVEL_COLORS[level],
                    borderColor: `${LEVEL_COLORS[level]}44`,
                  } : {}),
                }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
                <span style={styles.progsTabCount}>
                  {PROGRESSIONS[level].length}
                </span>
              </button>
            ))}
          </div>

          {/* Progression cards */}
          <div style={styles.progsGrid}>
            {PROGRESSIONS[activeProgLevel].map((prog, i) => {
              // Deduplicate chord list for display
              const uniqueChords = [...new Set(prog.chords)];
              return (
                <div key={i} style={styles.progCard}>
                  <div style={styles.progCardHeader}>
                    <h3 style={styles.progCardName}>{prog.name}</h3>
                    <span style={{
                      ...styles.progCardLevel,
                      color: LEVEL_COLORS[activeProgLevel],
                    }}>
                      {uniqueChords.length} chords
                    </span>
                  </div>
                  <p style={styles.progCardDesc}>{prog.description}</p>

                  {/* Chord sequence display */}
                  <div style={styles.progSequence}>
                    <span style={styles.progSeqLabel}>SEQUENCE</span>
                    <div style={styles.progSeqChords}>
                      {prog.chords.map((c, j) => (
                        <span key={j} style={styles.progSeqItem}>
                          <button
                            onClick={() => setSelectedChord(c)}
                            style={{
                              ...styles.progSeqChord,
                              color: selectedChord === c
                                ? "#ffb000"
                                : CHORD_LIBRARY[c]
                                  ? "#e2e8f0"
                                  : "#475569",
                            }}
                          >
                            {c}
                          </button>
                          {j < prog.chords.length - 1 && (
                            <span style={styles.progSeqArrow}>→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  page: {
    padding: "24px 16px 60px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  container: {},

  // Header
  header: {
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
    color: "#94a3b8",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "620px",
  },

  // Filters
  filtersBar: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "18px 20px",
    background: "#111827",
    border: "1px solid #1a233244",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "#0d1220",
    border: "1px solid #1a233288",
    borderRadius: "8px",
  },
  searchIcon: { fontSize: "14px", opacity: 0.5 },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "#e2e8f0",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "14px",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#475569",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    padding: "2px 6px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  filterLabel: {
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    color: "#475569",
    letterSpacing: "1.5px",
  },
  pills: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 12px",
    background: "#0d1220",
    border: "1px solid #1a233266",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: "500",
    color: "#94a3b8",
    transition: "all 0.2s ease",
  },
  pillCount: {
    fontSize: "9px",
    opacity: 0.6,
  },

  // Results bar
  resultsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    padding: "0 4px",
  },
  resultsCount: {
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
  },
  clearFilters: {
    background: "none",
    border: "none",
    color: "#ff6b2b",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "4px 8px",
  },

  // Detail panel wrapper
  detailWrapper: {
    marginBottom: "20px",
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "40px",
  },

  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "48px 20px",
    marginBottom: "40px",
  },
  emptyText: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    fontFamily: "'JetBrains Mono', monospace",
  },
  emptyReset: {
    background: "none",
    border: "1px solid #ff6b2b44",
    color: "#ff6b2b",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: "600",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  // Progressions section
  progsSection: {
    borderTop: "1px solid #1a233244",
    paddingTop: "32px",
  },
  progsTitle: {
    fontSize: "22px",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: "0 0 6px",
  },
  progsSubtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.6",
    margin: "0 0 18px",
    maxWidth: "540px",
  },
  progsTabs: {
    display: "flex",
    gap: "6px",
    marginBottom: "16px",
  },
  progsTab: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "#0d1220",
    border: "1px solid #1a233266",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    transition: "all 0.2s ease",
  },
  progsTabCount: {
    fontSize: "9px",
    opacity: 0.6,
  },
  progsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "12px",
  },
  progCard: {
    padding: "16px 18px",
    background: "#111827",
    border: "1px solid #1a233244",
    borderRadius: "10px",
  },
  progCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  progCardName: {
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: 0,
  },
  progCardLevel: {
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
  },
  progCardDesc: {
    margin: "0 0 12px",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
    lineHeight: "1.4",
  },
  progSequence: {},
  progSeqLabel: {
    display: "block",
    fontSize: "8px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    color: "#475569",
    letterSpacing: "1.5px",
    marginBottom: "6px",
  },
  progSeqChords: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    flexWrap: "wrap",
  },
  progSeqItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
  },
  progSeqChord: {
    background: "none",
    border: "none",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "2px 4px",
    borderRadius: "3px",
    transition: "color 0.2s ease",
  },
  progSeqArrow: {
    fontSize: "10px",
    color: "#1a2332",
    margin: "0 1px",
  },
};
