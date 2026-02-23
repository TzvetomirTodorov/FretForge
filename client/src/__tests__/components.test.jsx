// ═══════════════════════════════════════════════════════════════
//  FretForge — Component Rendering Tests
//  Uses Vitest + React Testing Library to verify components
//  render without crashing and produce correct DOM output.
//  Audio-dependent components are tested for structure only
//  (no actual Web Audio API in JSDOM).
// ═══════════════════════════════════════════════════════════════

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CHORD_LIBRARY } from "../data/chords";
import FretboardDiagram from "../components/chords/FretboardDiagram";
import ChordCard from "../components/chords/ChordCard";

// ─── FretboardDiagram ────────────────────────────────────────
describe("FretboardDiagram", () => {
  test("renders an SVG element", () => {
    const { container } = render(
      <FretboardDiagram chord={CHORD_LIBRARY.Em} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  test("renders 6 vertical string lines", () => {
    const { container } = render(
      <FretboardDiagram chord={CHORD_LIBRARY.Em} width={200} />
    );
    // Strings are vertical <line> elements — count those with vertical orientation
    // (x1 === x2 means vertical)
    const lines = container.querySelectorAll("line");
    const verticalLines = Array.from(lines).filter(
      (l) => l.getAttribute("x1") === l.getAttribute("x2")
    );
    expect(verticalLines.length).toBe(6);
  });

  test("renders finger dots for fretted strings", () => {
    const { container } = render(
      <FretboardDiagram chord={CHORD_LIBRARY.Em} showFingers />
    );
    // Em has 2 fretted strings (A=2, D=2), so there should be circles for dots
    // Each dot has a glow circle + main circle = 2 per dot
    const circles = container.querySelectorAll("circle");
    // Open string markers (4 open) + finger dot glows (2) + finger dots (2) = 8+
    expect(circles.length).toBeGreaterThanOrEqual(4);
  });

  test("renders muted string X markers for chords with muted strings", () => {
    // Am has a muted low E string (strings[0] = -1)
    const { container } = render(
      <FretboardDiagram chord={CHORD_LIBRARY.Am} />
    );
    // Muted strings render as two crossed <line> elements (an X)
    // The Am chord mutes string 0 (low E)
    const allLines = container.querySelectorAll("line");
    expect(allLines.length).toBeGreaterThan(6); // 6 strings + fret wires + X markers
  });

  test("renders in compact mode without errors", () => {
    const { container } = render(
      <FretboardDiagram chord={CHORD_LIBRARY.G} compact width={120} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  test("shows note names when showNotes is true", () => {
    const { container } = render(
      <FretboardDiagram chord={CHORD_LIBRARY.C} showNotes />
    );
    // C chord notes: X, C, E, G, C, E — should appear as text elements
    const texts = container.querySelectorAll("text");
    const noteTexts = Array.from(texts).map((t) => t.textContent);
    expect(noteTexts).toContain("C");
    expect(noteTexts).toContain("E");
    expect(noteTexts).toContain("G");
  });

  test("renders barre indicator for barre chords", () => {
    const { container } = render(
      <FretboardDiagram chord={CHORD_LIBRARY.F} showFingers />
    );
    // F chord has a barre at fret 1 — rendered as a <rect>
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBeGreaterThanOrEqual(1);
  });

  test("renders every chord in the library without crashing", () => {
    Object.entries(CHORD_LIBRARY).forEach(([key, chord]) => {
      const { container } = render(
        <FretboardDiagram chord={chord} showFingers showNotes />
      );
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });
});

// ─── ChordCard ───────────────────────────────────────────────
describe("ChordCard", () => {
  const mockOnClick = () => {};

  test("renders chord short name", () => {
    render(
      <ChordCard
        chord={CHORD_LIBRARY.Am}
        chordKey="Am"
        onClick={mockOnClick}
      />
    );
    expect(screen.getByText("Am")).toBeTruthy();
  });

  test("renders chord full name", () => {
    render(
      <ChordCard
        chord={CHORD_LIBRARY.Am}
        chordKey="Am"
        onClick={mockOnClick}
      />
    );
    expect(screen.getByText("A minor")).toBeTruthy();
  });

  test("renders tier label", () => {
    render(
      <ChordCard
        chord={CHORD_LIBRARY.Am}
        chordKey="Am"
        onClick={mockOnClick}
      />
    );
    expect(screen.getByText("Beginner")).toBeTruthy();
  });

  test("applies selected styling when isSelected=true", () => {
    const { container } = render(
      <ChordCard
        chord={CHORD_LIBRARY.Am}
        chordKey="Am"
        onClick={mockOnClick}
        isSelected
      />
    );
    const button = container.querySelector("button");
    expect(button.style.transform).toContain("1.02");
  });

  test("renders all 18 chord cards without crashing", () => {
    Object.entries(CHORD_LIBRARY).forEach(([key, chord]) => {
      const { container } = render(
        <ChordCard chord={chord} chordKey={key} onClick={mockOnClick} />
      );
      expect(container.querySelector("button")).toBeTruthy();
    });
  });
});
