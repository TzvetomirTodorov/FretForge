import { useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
//  FretForge — FretboardDiagram (SVG)
//  Renders any chord as an interactive fretboard diagram
//  Supports: finger dots, barre indicators, open/muted markers,
//  fret position labels, finger numbers, and string colors
//
//  COORD SYSTEM:
//  Strings run vertically (left = low E, right = high E)
//  Frets run horizontally (top = nut/lowest fret)
//  Standard guitar convention, just like real chord diagrams
// ═══════════════════════════════════════════════════════════════

// FretForge string color identity system
const STRING_COLORS = [
  "#ff2d6b", // Low E (string 6)
  "#ff6b2b", // A (string 5)
  "#ffb000", // D (string 4)
  "#00ff9f", // G (string 3)
  "#02d7f2", // B (string 2)
  "#a855f7", // High E (string 1)
];

// Finger labels for the dot overlays
const FINGER_LABELS = { 0: "", 1: "1", 2: "2", 3: "3", 4: "4" };

export default function FretboardDiagram({
  chord,           // Chord object from CHORD_LIBRARY
  width = 160,     // SVG width — scales proportionally
  showFingers = true,
  showNotes = false,
  compact = false,  // Smaller mode for grid cards
}) {
  // ─── Geometry calculations ─────────────────────────────────
  // All positions are derived from the width so the diagram scales cleanly
  const config = useMemo(() => {
    const strings = chord.strings;   // [lowE, A, D, G, B, highE] fret positions
    const fingers = chord.fingers;   // [lowE, A, D, G, B, highE] finger numbers
    const barreAt = chord.barreAt;   // Fret number for barre (0 = none)

    // Determine the fret range to display
    // For open chords (all frets ≤ 3), show frets 1-4 with nut
    // For barre/higher chords, show a window around the played frets
    const playedFrets = strings.filter((f) => f > 0);
    const minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 1;
    const maxFret = playedFrets.length > 0 ? Math.max(...playedFrets) : 3;

    let startFret = 1;
    let showNut = true;

    if (maxFret > 4 || (barreAt > 0 && minFret > 1)) {
      // Higher position chord — offset the window
      startFret = minFret;
      showNut = false;
    }

    const fretsToShow = 4; // Always show 4 frets
    const endFret = startFret + fretsToShow;

    // Layout dimensions
    const padding = { top: compact ? 24 : 30, bottom: compact ? 10 : 14, left: 20, right: 20 };
    const totalHeight = compact ? 130 : 180;
    const diagramWidth = width - padding.left - padding.right;
    const diagramHeight = totalHeight - padding.top - padding.bottom;
    const stringSpacing = diagramWidth / 5; // 6 strings, 5 gaps
    const fretSpacing = diagramHeight / fretsToShow;

    return {
      strings, fingers, barreAt,
      startFret, endFret, fretsToShow, showNut,
      padding, totalHeight, diagramWidth, diagramHeight,
      stringSpacing, fretSpacing, playedFrets,
    };
  }, [chord, width, compact]);

  const {
    strings, fingers, barreAt,
    startFret, endFret, fretsToShow, showNut,
    padding, totalHeight, diagramWidth, diagramHeight,
    stringSpacing, fretSpacing,
  } = config;

  // ─── Helper: get x position for a string (0-5, left to right) ──
  const stringX = (i) => padding.left + i * stringSpacing;

  // ─── Helper: get y position for a fret (relative to startFret) ──
  // The dot sits in the middle of the fret space above the fret wire
  const fretY = (fret) => {
    const relFret = fret - startFret;
    return padding.top + (relFret + 0.5) * fretSpacing;
  };

  // ─── Helper: fret wire y position ──────────────────────────
  const fretWireY = (fretIndex) => padding.top + fretIndex * fretSpacing;

  // ─── Determine which strings are part of the barre ─────────
  const barreStrings = useMemo(() => {
    if (!barreAt) return [];
    const indices = [];
    for (let i = 0; i < 6; i++) {
      if (strings[i] === barreAt && fingers[i] === 1) {
        indices.push(i);
      }
    }
    return indices;
  }, [strings, fingers, barreAt]);

  const dotRadius = compact ? 7 : 9;

  return (
    <svg
      viewBox={`0 0 ${width} ${totalHeight}`}
      width={width}
      height={totalHeight}
      style={{ display: "block" }}
    >
      {/* ─── Fret position indicator (when not at nut) ──── */}
      {!showNut && (
        <text
          x={padding.left - 14}
          y={fretY(startFret)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#94a3b8"
          fontSize={compact ? "9" : "11"}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
        >
          {startFret}
        </text>
      )}

      {/* ─── Nut (thick top line for open chords) ───────── */}
      {showNut && (
        <line
          x1={padding.left - 2}
          y1={padding.top}
          x2={padding.left + diagramWidth + 2}
          y2={padding.top}
          stroke="#e2e8f0"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}

      {/* ─── Fret wires (horizontal lines) ──────────────── */}
      {Array.from({ length: fretsToShow + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={padding.left}
          y1={fretWireY(i)}
          x2={padding.left + diagramWidth}
          y2={fretWireY(i)}
          stroke={i === 0 && showNut ? "transparent" : "#1a2332"}
          strokeWidth="1"
        />
      ))}

      {/* ─── Strings (vertical lines) ───────────────────── */}
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={`string-${i}`}
          x1={stringX(i)}
          y1={padding.top}
          x2={stringX(i)}
          y2={padding.top + diagramHeight}
          stroke={STRING_COLORS[i]}
          strokeWidth={strings[i] === -1 ? 0.5 : 1}
          opacity={strings[i] === -1 ? 0.2 : 0.4}
        />
      ))}

      {/* ─── Barre indicator (curved bar across strings) ── */}
      {barreAt > 0 && barreStrings.length >= 2 && (() => {
        const firstStr = Math.min(...barreStrings);
        const lastStr = Math.max(...barreStrings);
        const y = fretY(barreAt);
        const x1 = stringX(firstStr);
        const x2 = stringX(lastStr);

        return (
          <rect
            x={x1 - dotRadius}
            y={y - dotRadius * 0.6}
            width={x2 - x1 + dotRadius * 2}
            height={dotRadius * 1.2}
            rx={dotRadius * 0.6}
            fill="#e2e8f0"
            opacity="0.85"
          />
        );
      })()}

      {/* ─── Finger dots ────────────────────────────────── */}
      {strings.map((fret, i) => {
        if (fret <= 0) return null; // Skip open and muted strings
        if (fret < startFret || fret >= endFret) return null; // Out of visible range

        // Skip individual dots for barre-covered strings (barre draws them)
        const isBarreString = barreAt > 0 && fret === barreAt && fingers[i] === 1;
        if (isBarreString && barreStrings.length >= 2) return null;

        const color = STRING_COLORS[i];
        const cx = stringX(i);
        const cy = fretY(fret);

        return (
          <g key={`dot-${i}`}>
            {/* Glow behind the dot */}
            <circle cx={cx} cy={cy} r={dotRadius + 3} fill={color} opacity="0.15" />
            {/* Main dot */}
            <circle cx={cx} cy={cy} r={dotRadius} fill={color} opacity="0.9" />
            {/* Finger number */}
            {showFingers && fingers[i] > 0 && !isBarreString && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#0a0e17"
                fontSize={compact ? "8" : "10"}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="700"
              >
                {FINGER_LABELS[fingers[i]] || fingers[i]}
              </text>
            )}
          </g>
        );
      })}

      {/* ─── Barre finger label ─────────────────────────── */}
      {barreAt > 0 && barreStrings.length >= 2 && (
        <text
          x={stringX(Math.min(...barreStrings))}
          y={fretY(barreAt)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#0a0e17"
          fontSize={compact ? "8" : "10"}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="700"
        >
          1
        </text>
      )}

      {/* ─── Open / Muted string markers (above nut) ───── */}
      {strings.map((fret, i) => {
        const x = stringX(i);
        const y = padding.top - (compact ? 10 : 14);

        if (fret === 0) {
          // Open string — small circle outline
          return (
            <circle
              key={`open-${i}`}
              cx={x}
              cy={y}
              r={compact ? 4 : 5}
              fill="none"
              stroke={STRING_COLORS[i]}
              strokeWidth="1.5"
              opacity="0.7"
            />
          );
        }
        if (fret === -1) {
          // Muted string — X marker
          const s = compact ? 3 : 4;
          return (
            <g key={`muted-${i}`} opacity="0.5">
              <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={x + s} y1={y - s} x2={x - s} y2={y + s} stroke="#94a3b8" strokeWidth="1.5" />
            </g>
          );
        }
        return null;
      })}

      {/* ─── Note names below strings (optional) ─────────── */}
      {showNotes && chord.notes && chord.notes.map((note, i) => (
        <text
          key={`note-${i}`}
          x={stringX(i)}
          y={padding.top + diagramHeight + (compact ? 10 : 14)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={note === "X" ? "#475569" : STRING_COLORS[i]}
          fontSize={compact ? "8" : "10"}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
          opacity="0.7"
        >
          {note}
        </text>
      ))}
    </svg>
  );
}
