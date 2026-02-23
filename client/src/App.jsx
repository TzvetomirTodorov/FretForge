import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import TunerPage from "./pages/TunerPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";

// ═══════════════════════════════════════════════════════════════
//  FretForge — Main Application Shell
//  Routes: Home, Tuner, Practice, Chords, Scales, Auth
//  AuthProvider wraps the entire app for global auth state
//  AUDIT: Auth-aware nav shows user menu when logged in,
//  login prompt when not. All features work without login —
//  auth is optional and only required for progress tracking.
// ═══════════════════════════════════════════════════════════════

// ─── Navigation ──────────────────────────────────────────────
function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const links = [
    { path: "/", label: "Home", icon: "🎸" },
    { path: "/tuner", label: "Tuner", icon: "🎵" },
    { path: "/chords", label: "Chords", icon: "🤘" },
    { path: "/practice", label: "Practice", icon: "🔥" },
    { path: "/scales", label: "Scales", icon: "🎼" },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

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

          {/* Auth section in nav */}
          {isAuthenticated ? (
            <div className="nav-user-wrapper">
              <button
                className="nav-user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="nav-user-avatar">
                  {user.username?.[0]?.toUpperCase() || "?"}
                </span>
                <span className="nav-user-name">{user.username}</span>
                <span className="nav-user-level">Lv{user.level}</span>
              </button>

              {userMenuOpen && (
                <div className="nav-user-dropdown">
                  <div className="nav-user-info">
                    <span className="nav-user-info-name">{user.username}</span>
                    <span className="nav-user-info-email">{user.email}</span>
                  </div>
                  <div className="nav-user-stats">
                    <span>⚡ {user.xp} XP</span>
                    <span>🔥 {user.currentStreak} day streak</span>
                  </div>
                  <button className="nav-user-logout" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="nav-link nav-auth-link">
              Sign In
            </Link>
          )}
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
          {isAuthenticated ? (
            <>
              <div className="nav-mobile-user-info">
                <span>👤 {user.username} · Lv{user.level}</span>
                <span>⚡ {user.xp} XP</span>
              </div>
              <button
                className="nav-mobile-link"
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{ border: "none", background: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
              >
                <span>🚪</span> Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
              <span>🔑</span> Sign In / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

// ─── Home Page (now uses dedicated LandingPage component) ────
function Home() { return <LandingPage />; }

// ─── Placeholder Pages ───────────────────────────────────────
function Tuner() { return <TunerPage />; }

function Chords() {
  return (
    <div className="page"><div className="container">
      <h2>🤘 Chord Library</h2>
      <p className="mono" style={{ color: "var(--text-muted)" }}>Phase 1 — Coming soon. Interactive chord diagrams with fretboard display.</p>
    </div></div>
  );
}

function Practice() {
  return (
    <div className="page"><div className="container">
      <h2>🔥 Practice Engine</h2>
      <p className="mono" style={{ color: "var(--text-muted)" }}>Phase 2 — Coming soon. Random chord progressions with audio detection feedback.</p>
    </div></div>
  );
}

function Scales() {
  return (
    <div className="page"><div className="container">
      <h2>🎼 Scale Patterns</h2>
      <p className="mono" style={{ color: "var(--text-muted)" }}>Phase 2 — Coming soon. Interactive scale patterns on the fretboard.</p>
    </div></div>
  );
}

// ─── App Shell ───────────────────────────────────────────────
function AppContent() {
  return (
    <div className="app">
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/chords" element={<Chords />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/scales" element={<Scales />} />
          <Route path="/auth" element={<AuthPage />} />
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
            <a href="https://github.com/TzvetomirTodorov/FretForge" target="_blank" rel="noreferrer">GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// AuthProvider must be inside Router (useNavigate needs Router context)
// but must wrap AppContent so Nav can use useAuth()
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
