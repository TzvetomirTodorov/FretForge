// ═══════════════════════════════════════════════════════════════
//  FretForge — Chord Library
//  Each chord defines: name, type, fingering positions, difficulty
//  Fingering format: [E_low, A, D, G, B, E_high]
//    -1 = muted/not played, 0 = open string, 1+ = fret number
// ═══════════════════════════════════════════════════════════════

// Finger assignments: 1=index, 2=middle, 3=ring, 4=pinky, 0=open, x=muted
// barreAt: fret number where a barre is placed (0 = no barre)

export const CHORD_LIBRARY = {
  // ─── TIER 1: First Chords (Week 1-2) ──────────────────────
  Em: {
    name: "E minor",
    short: "Em",
    type: "minor",
    tier: 1,
    frets: [-1, -1, 2, 2, 0, 0], // actually [0, 2, 2, 0, 0, 0]
    // Corrected: standard open Em
    strings: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    barreAt: 0,
    notes: ["E", "B", "E", "G", "B", "E"],
    tips: "Your easiest chord — just two fingers on the A and D strings, 2nd fret.",
  },
  Am: {
    name: "A minor",
    short: "Am",
    type: "minor",
    tier: 1,
    strings: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
    barreAt: 0,
    notes: ["X", "A", "E", "A", "C", "E"],
    tips: "Shape looks like Em shifted down one string. Index on B string, 1st fret.",
  },

  // ─── TIER 2: Essential Open Chords (Week 2-4) ─────────────
  E: {
    name: "E major",
    short: "E",
    type: "major",
    tier: 2,
    strings: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    barreAt: 0,
    notes: ["E", "B", "E", "G#", "B", "E"],
    tips: "Like Em but add your index finger on G string, 1st fret.",
  },
  A: {
    name: "A major",
    short: "A",
    type: "major",
    tier: 2,
    strings: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    barreAt: 0,
    notes: ["X", "A", "E", "A", "C#", "E"],
    tips: "Three fingers squeezed onto the 2nd fret — D, G, B strings.",
  },
  D: {
    name: "D major",
    short: "D",
    type: "major",
    tier: 2,
    strings: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    barreAt: 0,
    notes: ["X", "X", "D", "A", "D", "F#"],
    tips: "Triangle shape on the top three strings. Only strum strings 4-1.",
  },
  G: {
    name: "G major",
    short: "G",
    type: "major",
    tier: 2,
    strings: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    barreAt: 0,
    notes: ["G", "B", "D", "G", "B", "G"],
    tips: "Big stretch! Middle finger on A string 2nd fret, ring finger low E 3rd fret, pinky high E 3rd fret.",
  },
  C: {
    name: "C major",
    short: "C",
    type: "major",
    tier: 2,
    strings: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    barreAt: 0,
    notes: ["X", "C", "E", "G", "C", "E"],
    tips: "Ring finger A string 3rd fret, middle D string 2nd fret, index B string 1st fret. Staircase shape.",
  },

  // ─── TIER 3: Minor Variations & 7ths (Month 2) ────────────
  Dm: {
    name: "D minor",
    short: "Dm",
    type: "minor",
    tier: 3,
    strings: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
    barreAt: 0,
    notes: ["X", "X", "D", "A", "D", "F"],
    tips: "Like D major but move the high E finger down to 1st fret.",
  },
  E7: {
    name: "E dominant 7",
    short: "E7",
    type: "dominant7",
    tier: 3,
    strings: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    barreAt: 0,
    notes: ["E", "B", "D", "G#", "B", "E"],
    tips: "E major but lift your ring finger off the D string. Bluesy!",
  },
  A7: {
    name: "A dominant 7",
    short: "A7",
    type: "dominant7",
    tier: 3,
    strings: [-1, 0, 2, 0, 2, 0],
    fingers: [0, 0, 2, 0, 3, 0],
    barreAt: 0,
    notes: ["X", "A", "E", "G", "C#", "E"],
    tips: "A major but lift off the G string. Essential for blues.",
  },
  D7: {
    name: "D dominant 7",
    short: "D7",
    type: "dominant7",
    tier: 3,
    strings: [-1, -1, 0, 2, 1, 2],
    fingers: [0, 0, 0, 2, 1, 3],
    barreAt: 0,
    notes: ["X", "X", "D", "A", "C", "F#"],
    tips: "D major variant — index on B string 1st fret.",
  },
  Am7: {
    name: "A minor 7",
    short: "Am7",
    type: "minor7",
    tier: 3,
    strings: [-1, 0, 2, 0, 1, 0],
    fingers: [0, 0, 2, 0, 1, 0],
    barreAt: 0,
    notes: ["X", "A", "E", "G", "C", "E"],
    tips: "Am but lift off the G string. Soft, jazzy feel.",
  },
  Em7: {
    name: "E minor 7",
    short: "Em7",
    type: "minor7",
    tier: 3,
    strings: [0, 2, 0, 0, 0, 0],
    fingers: [0, 2, 0, 0, 0, 0],
    barreAt: 0,
    notes: ["E", "B", "D", "G", "B", "E"],
    tips: "The easiest chord in existence — one finger! Middle on A string 2nd fret.",
  },

  // ─── TIER 4: Barre Chords & Power Chords (Month 6+) ──────
  F: {
    name: "F major (barre)",
    short: "F",
    type: "major",
    tier: 4,
    strings: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barreAt: 1,
    notes: ["F", "C", "F", "A", "C", "F"],
    tips: "The infamous barre chord. Index finger barres all strings at fret 1. E-shape moved up one fret.",
  },
  Bm: {
    name: "B minor (barre)",
    short: "Bm",
    type: "minor",
    tier: 4,
    strings: [-1, 2, 4, 4, 3, 2],
    fingers: [0, 1, 3, 4, 2, 1],
    barreAt: 2,
    notes: ["X", "B", "F#", "B", "D", "F#"],
    tips: "Am shape with a barre at fret 2. The second barre chord most people learn.",
  },
  E5: {
    name: "E power chord",
    short: "E5",
    type: "power",
    tier: 4,
    strings: [0, 2, 2, -1, -1, -1],
    fingers: [0, 1, 2, 0, 0, 0],
    barreAt: 0,
    notes: ["E", "B", "E", "X", "X", "X"],
    tips: "Root + 5th. Neither major nor minor. The backbone of rock.",
  },
  A5: {
    name: "A power chord",
    short: "A5",
    type: "power",
    tier: 4,
    strings: [-1, 0, 2, 2, -1, -1],
    fingers: [0, 0, 1, 2, 0, 0],
    barreAt: 0,
    notes: ["X", "A", "E", "A", "X", "X"],
    tips: "Same shape as E5, shifted down one string.",
  },
  G5: {
    name: "G power chord",
    short: "G5",
    type: "power",
    tier: 4,
    strings: [3, 5, 5, -1, -1, -1],
    fingers: [1, 3, 4, 0, 0, 0],
    barreAt: 0,
    notes: ["G", "D", "G", "X", "X", "X"],
    tips: "Movable power chord shape on the low E string.",
  },
};

// ─── Chord Progressions by Difficulty ─────────────────────
export const PROGRESSIONS = {
  beginner: [
    { name: "Two-Chord Wonder", chords: ["Em", "Am"], description: "Just two chords — focus on clean transitions" },
    { name: "Classic Three", chords: ["G", "C", "D"], description: "The most popular progression in pop music" },
    { name: "Campfire Song", chords: ["G", "Em", "C", "D"], description: "Play a hundred songs with these four chords" },
    { name: "12-Bar Blues in A", chords: ["A", "A", "A", "A", "D", "D", "A", "A", "E", "D", "A", "E"], description: "The foundation of blues, rock, and jazz" },
    { name: "Am Ballad", chords: ["Am", "G", "C", "Em"], description: "Beautiful minor progression for emotional songs" },
    { name: "Horse Ride", chords: ["Em", "D"], description: "'Horse With No Name' — two chord alternation" },
  ],
  intermediate: [
    { name: "Pop Anthem", chords: ["C", "G", "Am", "F"], description: "The 'four chord song' — I-V-vi-IV" },
    { name: "Blues Shuffle", chords: ["E7", "A7", "E7", "E7", "A7", "A7", "E7", "E7", "D7", "A7", "E7", "D7"], description: "12-bar blues with dominant 7ths" },
    { name: "Minor Drama", chords: ["Am", "Dm", "E", "Am"], description: "i-iv-V-i in A minor — dramatic and moody" },
    { name: "Jazz Lite", chords: ["Am7", "Dm", "G", "C"], description: "ii-V-I feel with minor 7th color" },
    { name: "Rock Anthem", chords: ["E5", "G5", "A5", "E5"], description: "Power chord rock progression" },
  ],
  advanced: [
    { name: "Barre Workout", chords: ["F", "Bm", "G", "Am"], description: "Multiple barre chords in sequence" },
    { name: "Jazz Standard", chords: ["Am7", "D7", "G", "C", "F", "Bm", "E7", "Am"], description: "Full cycle progression with barre chords" },
  ],
};

// ─── Standard Tuning Reference ────────────────────────────
export const STANDARD_TUNING = [
  { string: 6, note: "E", freq: 82.41, name: "Low E", color: "var(--string-E-low)" },
  { string: 5, note: "A", freq: 110.0, name: "A", color: "var(--string-A)" },
  { string: 4, note: "D", freq: 146.83, name: "D", color: "var(--string-D)" },
  { string: 3, note: "G", freq: 196.0, name: "G", color: "var(--string-G)" },
  { string: 2, note: "B", freq: 246.94, name: "B", color: "var(--string-B)" },
  { string: 1, note: "E", freq: 329.63, name: "High E", color: "var(--string-E-high)" },
];

// ─── Note Frequencies (for pitch detection matching) ──────
export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Calculate the frequency of any note: A4 = 440Hz standard
export function noteFrequency(noteName, octave) {
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) return null;
  // A4 = index 9, octave 4
  const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - 9);
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// Convert a frequency to the nearest note name + cents offset
export function frequencyToNote(freq) {
  if (!freq || freq <= 0) return null;
  const semitones = 12 * Math.log2(freq / 440);
  const roundedSemitones = Math.round(semitones);
  const cents = Math.round((semitones - roundedSemitones) * 100);
  const noteIndex = ((roundedSemitones % 12) + 12 + 9) % 12; // A=9 in our array
  const octave = Math.floor((roundedSemitones + 9) / 12) + 4;
  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    cents, // negative = flat, positive = sharp
    freq,
  };
}
