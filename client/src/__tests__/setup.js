// ═══════════════════════════════════════════════════════════════
//  FretForge — Vitest Setup
//  Configures React Testing Library's JSDOM cleanup between tests
//  and provides any global mocks needed by components
// ═══════════════════════════════════════════════════════════════

import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Automatically unmount React components after each test
afterEach(() => {
  cleanup();
});

// ─── Mock Web Audio API (not available in JSDOM) ─────────────
// Components that use AudioContext will import useAudio/usePitch,
// which we don't test directly here (they need real audio hardware).
// This mock prevents errors when components reference Audio APIs.
globalThis.AudioContext = class AudioContext {
  constructor() {
    this.state = "suspended";
    this.sampleRate = 44100;
  }
  createAnalyser() { return { fftSize: 2048, connect: () => {} }; }
  createMediaStreamSource() { return { connect: () => {} }; }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
};

globalThis.navigator.mediaDevices = {
  getUserMedia: () => Promise.resolve(new MediaStream()),
};
