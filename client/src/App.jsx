import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import TunerPage from "./pages/TunerPage.jsx";

// ═══════════════════════════════════════════════════════════════
//  FretForge — Main Application Shell
//  Routes: Home, Tuner, Practice, Chords, Scales
//  Phase 1 MVP: Tuner + Chord Library + Practice Engine
// ═══════════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Navigation ──────────────────────────────────────────────
function Nav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { path: "/", label: "Home", icon: "🎸" },
    { path: "/tuner", label: "Tuner", icon: "🎵" },
    { path: "/chords", label: "Chords", icon: "🤘" },
    { path: "/practice", label: "Practice", icon: "🔥" },
    { path: "/scales", label: "Scales", icon: "🎼" },
  ];

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🔥</span>
          <span className="logo-text">FretForge</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
            >
              <span className="nav-link-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-mobile-link ${location.pathname === link.path ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Home Page (placeholder — will be the landing page) ──────
function Home() {
  return (
    <div className="page home">
      <div className="container">
        <div className="hero">
          <h1 className="hero-title">
            <span className="hero-icon">🔥</span>
            FretForge
          </h1>
          <p className="hero-subtitle mono">
            Open-source guitar learning companion
          </p>
          <p className="hero-description">
            Real-time audio feedback, interactive chord diagrams, scale patterns,
            randomized practice sessions, and progress tracking — all running in your
            browser. No subscription. No app store. Just you, your guitar, and the
            Web Audio API.
          </p>
          <div className="hero-actions">
            <Link to="/tuner" className="btn btn-primary">
              🎵 Tune Your Guitar
            </Link>
            <Link to="/practice" className="btn btn-outline">
              🔥 Start Practicing
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="features-grid">
          <div className="card feature-card">
            <div className="feature-icon">🎵</div>
            <h3>Chromatic Tuner</h3>
            <p>Tune by ear with real-time pitch detection through your browser mic. No app needed.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">🤘</div>
            <h3>Chord Library</h3>
            <p>Interactive diagrams for open chords, barre chords, and power chords with finger placement guides.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Practice Engine</h3>
            <p>Random chord progressions at your skill level. FretForge listens and tells you if you nailed it.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">🎼</div>
            <h3>Scale Patterns</h3>
            <p>Pentatonic, blues, major, and minor scales displayed on an interactive fretboard.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">⏱</div>
            <h3>Metronome</h3>
            <p>Sample-accurate BPM metronome using Web Audio API scheduling — no drift, ever.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>XP, streaks, achievements, and practice history. Watch yourself level up over weeks and months.</p>
          </div>
        </div>

        <div className="open-source-banner card">
          <p className="mono" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            {">"} cat LICENSE
          </p>
          <p>
            FretForge is <strong>MIT licensed</strong> and open source. Built with the PERN stack
            (PostgreSQL, Express, React, Node.js) and powered by the Web Audio API. Contributions welcome.
          </p>
          <a
            href="https://github.com/TzvetomirTodorov/FretForge"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ marginTop: 16 }}
          >
            ⚡ View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder Pages (will be built out in Phase 1) ────────
function Tuner() {
  return <TunerPage />;
}

function Chords() {
  return (
    <div className="page">
      <div className="container">
        <h2>🤘 Chord Library</h2>
        <p className="mono" style={{ color: "var(--text-muted)" }}>
          Phase 1 — Coming soon. Interactive chord diagrams with fretboard display.
        </p>
      </div>
    </div>
  );
}

function Practice() {
  return (
    <div className="page">
      <div className="container">
        <h2>🔥 Practice Engine</h2>
        <p className="mono" style={{ color: "var(--text-muted)" }}>
          Phase 2 — Coming soon. Random chord progressions with audio detection feedback.
        </p>
      </div>
    </div>
  );
}

function Scales() {
  return (
    <div className="page">
      <div className="container">
        <h2>🎼 Scale Patterns</h2>
        <p className="mono" style={{ color: "var(--text-muted)" }}>
          Phase 2 — Coming soon. Interactive scale patterns on the fretboard.
        </p>
      </div>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <div className="app">
        <Nav />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tuner" element={<Tuner />} />
            <Route path="/chords" element={<Chords />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/scales" element={<Scales />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <p className="mono">
              <span style={{ color: "var(--accent-primary)" }}>const</span> builtWith ={" "}
              <span style={{ color: "var(--accent-secondary)" }}>{"{"}</span>{" "}
              PERN, Web Audio API, open source love{" "}
              <span style={{ color: "var(--accent-secondary)" }}>{"}"}</span>;
            </p>
            <p style={{ marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}>
              © {new Date().getFullYear()} FretForge — MIT License —{" "}
              <a href="https://github.com/TzvetomirTodorov/FretForge" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
