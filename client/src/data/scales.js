// ═══════════════════════════════════════════════════════════════
//  FretForge — Scale Library
//  Scale patterns defined as fret positions per string
//  Position format: array of [string, fret] pairs
//  string: 6=low E, 1=high E
// ═══════════════════════════════════════════════════════════════

export const SCALE_LIBRARY = {
  // ─── E Minor Pentatonic (open position) ─── Your first scale!
  em_pentatonic_open: {
    name: "E Minor Pentatonic (Open Position)",
    key: "E",
    type: "minor_pentatonic",
    tier: 1,
    // Intervals: root, minor 3rd, 4th, 5th, minor 7th
    intervals: ["1", "b3", "4", "5", "b7"],
    positions: [
      // [string, fret] — string 6 is low E, string 1 is high E
      [6, 0], [6, 3],           // Low E: E, G
      [5, 0], [5, 2],           // A: A, B
      [4, 0], [4, 2],           // D: D, E
      [3, 0], [3, 2],           // G: G, A
      [2, 0], [2, 3],           // B: B, D
      [1, 0], [1, 3],           // High E: E, G
    ],
    roots: [[6, 0], [4, 2], [1, 0]], // Root note positions (E)
    tips: "Your very first scale. Play slowly, one note at a time, ascending and descending. Root notes are E.",
  },

  // ─── A Minor Pentatonic (Box 1, 5th fret) ─── The iconic shape
  am_pentatonic_box1: {
    name: "A Minor Pentatonic (Box 1)",
    key: "A",
    type: "minor_pentatonic",
    tier: 2,
    intervals: ["1", "b3", "4", "5", "b7"],
    positions: [
      [6, 5], [6, 8],
      [5, 5], [5, 7],
      [4, 5], [4, 7],
      [3, 5], [3, 7],
      [2, 5], [2, 8],
      [1, 5], [1, 8],
    ],
    roots: [[6, 5], [4, 7], [1, 5]],
    tips: "THE most important movable scale shape. This exact pattern works in any key — just move it up or down the neck. Root at 5th fret = A minor.",
  },

  // ─── A Blues Scale (Box 1) ─── Pentatonic + the blue note
  a_blues_box1: {
    name: "A Blues Scale (Box 1)",
    key: "A",
    type: "blues",
    tier: 2,
    intervals: ["1", "b3", "4", "b5", "5", "b7"],
    positions: [
      [6, 5], [6, 8],
      [5, 5], [5, 6], [5, 7],   // b5 (Eb) added on A string fret 6
      [4, 5], [4, 7],
      [3, 5], [3, 6], [3, 7],   // b5 added on G string fret 6
      [2, 5], [2, 8],
      [1, 5], [1, 8],
    ],
    roots: [[6, 5], [4, 7], [1, 5]],
    tips: "Same as minor pentatonic but with the 'blue note' (b5) added. That one extra note makes everything sound bluesy.",
  },

  // ─── C Major Scale (open position) ───
  c_major_open: {
    name: "C Major Scale (Open Position)",
    key: "C",
    type: "major",
    tier: 3,
    intervals: ["1", "2", "3", "4", "5", "6", "7"],
    positions: [
      [6, 0], [6, 1], [6, 3],
      [5, 0], [5, 2], [5, 3],
      [4, 0], [4, 2], [4, 3],
      [3, 0], [3, 2],
      [2, 0], [2, 1], [2, 3],
      [1, 0], [1, 1], [1, 3],
    ],
    roots: [[5, 3], [2, 1]],
    tips: "The 'mother scale' — all natural notes (no sharps or flats). Learn this and you understand the backbone of Western music theory.",
  },

  // ─── A Natural Minor Scale (open position) ───
  a_minor_open: {
    name: "A Natural Minor (Open Position)",
    key: "A",
    type: "natural_minor",
    tier: 3,
    intervals: ["1", "2", "b3", "4", "5", "b6", "b7"],
    positions: [
      [6, 0], [6, 1], [6, 3],
      [5, 0], [5, 2], [5, 3],
      [4, 0], [4, 2], [4, 3],
      [3, 0], [3, 2],
      [2, 0], [2, 1], [2, 3],
      [1, 0], [1, 1], [1, 3],
    ],
    roots: [[6, 0] /* technically A is on 5th string open */, [5, 0], [3, 2]],
    tips: "Contains the exact same notes as C major but starting from A. This 'relative minor' concept is one of the most powerful ideas in music theory.",
  },

  // ─── G Major Pentatonic (open position) ───
  g_major_pentatonic_open: {
    name: "G Major Pentatonic (Open Position)",
    key: "G",
    type: "major_pentatonic",
    tier: 2,
    intervals: ["1", "2", "3", "5", "6"],
    positions: [
      [6, 0], [6, 2], [6, 3],
      [5, 0], [5, 2],
      [4, 0], [4, 2],
      [3, 0], [3, 2],
      [2, 0], [2, 3],
      [1, 0], [1, 2], [1, 3],
    ],
    roots: [[6, 3], [3, 0], [1, 3]],
    tips: "Bright, happy sound. Great for country and pop melodies. Same shape as E minor pentatonic — because G major and E minor are relatives!",
  },
};

// ─── Scale Difficulty Tiers ───────────────────────────────
export const SCALE_TIERS = {
  1: { name: "First Scale", description: "Open position pentatonic — get used to moving between notes" },
  2: { name: "Essential Shapes", description: "Movable pentatonic and blues patterns — the bread and butter of improvisation" },
  3: { name: "Full Scales", description: "Seven-note major and minor scales — understanding all the notes in a key" },
  4: { name: "Advanced", description: "Modes, exotic scales, and extended patterns — for when pentatonic isn't enough" },
};
