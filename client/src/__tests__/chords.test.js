// ═══════════════════════════════════════════════════════════════
//  FretForge — Chord Data Unit Tests
//  Tests pure functions: frequencyToNote, noteFrequency, and
//  validates the structural integrity of the chord library data
//  These run via Vitest (configured in vite.config.js)
// ═══════════════════════════════════════════════════════════════

import { describe, test, expect } from "vitest";
import {
  CHORD_LIBRARY,
  PROGRESSIONS,
  STANDARD_TUNING,
  NOTE_NAMES,
  noteFrequency,
  frequencyToNote,
} from "../data/chords";

// ─── frequencyToNote ─────────────────────────────────────────
describe("frequencyToNote", () => {
  test("440 Hz is A4 with 0 cents offset", () => {
    const result = frequencyToNote(440);
    expect(result.note).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBe(0);
  });

  test("82.41 Hz is E2 (low E string)", () => {
    const result = frequencyToNote(82.41);
    expect(result.note).toBe("E");
    expect(result.octave).toBe(2);
    expect(Math.abs(result.cents)).toBeLessThan(2);
  });

  test("329.63 Hz is E4 (high E string)", () => {
    const result = frequencyToNote(329.63);
    expect(result.note).toBe("E");
    expect(result.octave).toBe(4);
    expect(Math.abs(result.cents)).toBeLessThan(2);
  });

  test("returns null for frequency <= 0", () => {
    expect(frequencyToNote(0)).toBeNull();
    expect(frequencyToNote(-100)).toBeNull();
  });

  test("returns null for undefined/null", () => {
    expect(frequencyToNote(null)).toBeNull();
    expect(frequencyToNote(undefined)).toBeNull();
  });

  test("sharp pitch returns positive cents", () => {
    // Slightly above A4 = 440 Hz
    const result = frequencyToNote(445);
    expect(result.note).toBe("A");
    expect(result.cents).toBeGreaterThan(0);
  });

  test("flat pitch returns negative cents", () => {
    // Slightly below A4 = 440 Hz
    const result = frequencyToNote(435);
    expect(result.note).toBe("A");
    expect(result.cents).toBeLessThan(0);
  });
});

// ─── noteFrequency ───────────────────────────────────────────
describe("noteFrequency", () => {
  test("A4 is 440 Hz", () => {
    expect(noteFrequency("A", 4)).toBeCloseTo(440, 1);
  });

  test("middle C (C4) is ~261.63 Hz", () => {
    expect(noteFrequency("C", 4)).toBeCloseTo(261.63, 0);
  });

  test("returns null for invalid note name", () => {
    expect(noteFrequency("X", 4)).toBeNull();
    expect(noteFrequency("H", 3)).toBeNull();
  });

  test("octave doubling: A5 is twice A4", () => {
    const a4 = noteFrequency("A", 4);
    const a5 = noteFrequency("A", 5);
    expect(a5).toBeCloseTo(a4 * 2, 1);
  });
});

// ─── CHORD_LIBRARY structural integrity ──────────────────────
describe("CHORD_LIBRARY", () => {
  const chordEntries = Object.entries(CHORD_LIBRARY);

  test("has at least 18 chords", () => {
    expect(chordEntries.length).toBeGreaterThanOrEqual(18);
  });

  test.each(chordEntries)("%s has required fields", (key, chord) => {
    expect(chord.name).toBeDefined();
    expect(chord.short).toBeDefined();
    expect(chord.type).toBeDefined();
    expect(chord.tier).toBeGreaterThanOrEqual(1);
    expect(chord.tier).toBeLessThanOrEqual(4);
    expect(chord.strings).toHaveLength(6);
    expect(chord.fingers).toHaveLength(6);
    expect(chord.notes).toHaveLength(6);
    expect(chord.tips).toBeDefined();
    expect(typeof chord.barreAt).toBe("number");
  });

  test.each(chordEntries)("%s string values are -1, 0, or positive integers", (key, chord) => {
    chord.strings.forEach((s) => {
      expect(s).toBeGreaterThanOrEqual(-1);
      expect(Number.isInteger(s)).toBe(true);
    });
  });

  test.each(chordEntries)("%s finger values are 0-4", (key, chord) => {
    chord.fingers.forEach((f) => {
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(4);
    });
  });

  test("every chord type is one of the known types", () => {
    const validTypes = ["major", "minor", "dominant7", "minor7", "power"];
    chordEntries.forEach(([key, chord]) => {
      expect(validTypes).toContain(chord.type);
    });
  });
});

// ─── PROGRESSIONS structural integrity ───────────────────────
describe("PROGRESSIONS", () => {
  test("has beginner, intermediate, and advanced levels", () => {
    expect(PROGRESSIONS.beginner).toBeDefined();
    expect(PROGRESSIONS.intermediate).toBeDefined();
    expect(PROGRESSIONS.advanced).toBeDefined();
  });

  test("every chord referenced in progressions exists in CHORD_LIBRARY", () => {
    Object.values(PROGRESSIONS).forEach((level) => {
      level.forEach((prog) => {
        prog.chords.forEach((chordKey) => {
          expect(CHORD_LIBRARY[chordKey]).toBeDefined();
        });
      });
    });
  });

  test("every progression has at least 2 chords", () => {
    Object.values(PROGRESSIONS).forEach((level) => {
      level.forEach((prog) => {
        expect(prog.chords.length).toBeGreaterThanOrEqual(2);
        expect(prog.name).toBeDefined();
        expect(prog.description).toBeDefined();
      });
    });
  });
});

// ─── STANDARD_TUNING ────────────────────────────────────────
describe("STANDARD_TUNING", () => {
  test("has 6 strings", () => {
    expect(STANDARD_TUNING).toHaveLength(6);
  });

  test("frequencies are in ascending order (low to high)", () => {
    for (let i = 1; i < STANDARD_TUNING.length; i++) {
      expect(STANDARD_TUNING[i].freq).toBeGreaterThan(STANDARD_TUNING[i - 1].freq);
    }
  });

  test("notes match standard guitar tuning (EADGBE)", () => {
    const notes = STANDARD_TUNING.map((s) => s.note);
    expect(notes).toEqual(["E", "A", "D", "G", "B", "E"]);
  });
});

// ─── NOTE_NAMES ──────────────────────────────────────────────
describe("NOTE_NAMES", () => {
  test("has 12 notes", () => {
    expect(NOTE_NAMES).toHaveLength(12);
  });

  test("starts with C", () => {
    expect(NOTE_NAMES[0]).toBe("C");
  });

  test("contains all chromatic notes", () => {
    ["C", "D", "E", "F", "G", "A", "B"].forEach((note) => {
      expect(NOTE_NAMES).toContain(note);
    });
  });
});
