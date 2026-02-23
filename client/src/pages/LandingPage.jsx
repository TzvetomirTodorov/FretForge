import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// ═══════════════════════════════════════════════════════════════
//  FretForge — Landing Page
//  Animated, scroll-driven landing with forge/fire aesthetic
//  Features: ember particles, scroll-reveal sections, animated
//  fretboard hero, feature showcases, tech stack, CTAs
// ═══════════════════════════════════════════════════════════════

// ─── Ember Particle System ───────────────────────────────────
// Floating ember dots that rise from the bottom — lightweight CSS-only
function EmberParticles() {
  const embers = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animDuration: `${4 + Math.random() * 8}s`,
      animDelay: `${Math.random() * 6}s`,
      size: `${2 + Math.random() * 3}px`,
      opacity: 0.3 + Math.random() * 0.5,
    })), []);

  return (
    <div style={styles.emberContainer}>
      {embers.map((e) => (
        <div
          key={e.id}
          className="ember-particle"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            opacity: e.opacity,
            animationDuration: e.animDuration,
            animationDelay: e.animDelay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Scroll Reveal Hook ──────────────────────────────────────
// Elements fade/slide in when they enter the viewport
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// ─── Reveal Wrapper ──────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up" }) {
  const { ref, isVisible } = useScrollReveal();

  const transforms = {
    up: "translateY(32px)",
    left: "translateX(-32px)",
    right: "translateX(32px)",
    scale: "scale(0.95)",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : transforms[direction],
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated String Visualization ───────────────────────────
// Six guitar strings with pulsing glow — the visual signature of FretForge
function StringViz() {
  const stringColors = ["#ff2d6b", "#ff6b2b", "#ffb000", "#00ff9f", "#02d7f2", "#a855f7"];
  const stringNames = ["E", "A", "D", "G", "B", "e"];

  return (
    <div style={styles.stringViz}>
      {stringColors.map((color, i) => (
        <div key={i} style={styles.stringRow}>
          <span style={{ ...styles.stringLabel, color }}>{stringNames[i]}</span>
          <div style={styles.stringLineWrapper}>
            <div
              className="string-pulse"
              style={{
                ...styles.stringLine,
                height: `${6 - i}px`,
                background: `linear-gradient(90deg, transparent, ${color}88, ${color}, ${color}88, transparent)`,
                animationDelay: `${i * 0.15}s`,
                boxShadow: `0 0 ${8 - i}px ${color}44`,
              }}
            />
            {/* Fret dots */}
            {[0, 1, 2, 3, 4].map((fret) => (
              <div
                key={fret}
                style={{
                  ...styles.fretMarker,
                  left: `${20 + fret * 18}%`,
                  background: fret === 2 && (i === 0 || i === 1)
                    ? color
                    : "transparent",
                  border: fret === 2 && (i === 0 || i === 1)
                    ? `2px solid ${color}`
                    : "1px solid #1a233244",
                  boxShadow: fret === 2 && (i === 0 || i === 1)
                    ? `0 0 8px ${color}66`
                    : "none",
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <div style={styles.stringVizCaption}>
        <span style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
          ▲ Em chord — your first chord on FretForge
        </span>
      </div>
    </div>
  );
}

// ─── Feature Card ────────────────────────────────────────────
function FeatureCard({ icon, title, description, accent, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div style={{ ...styles.featureCard, borderColor: `${accent}22` }}>
        <div style={{ ...styles.featureIcon, background: `${accent}11`, color: accent }}>
          {icon}
        </div>
        <h3 style={styles.featureTitle}>{title}</h3>
        <p style={styles.featureDesc}>{description}</p>
        <div style={{ ...styles.featureAccent, background: accent }} />
      </div>
    </Reveal>
  );
}

// ─── Stat Counter ────────────────────────────────────────────
function StatItem({ value, label, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div style={styles.statItem}>
        <span style={styles.statValue}>{value}</span>
        <span style={styles.statLabel}>{label}</span>
      </div>
    </Reveal>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN LANDING PAGE
// ═══════════════════════════════════════════════════════════════
export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={styles.page}>
      {/* ─── CSS Animations (injected once) ──────────────── */}
      <style>{`
        @keyframes ember-rise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }
        .ember-particle {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, #ff6b2b, #ff2d6b88);
          animation: ember-rise linear infinite;
          pointer-events: none;
        }
        @keyframes string-vibrate {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }
        .string-pulse {
          animation: string-vibrate 2s ease-in-out infinite;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text {
          background: linear-gradient(135deg, #ff6b2b, #ffb000, #ff2d6b, #ff6b2b);
          background-size: 300% 300%;
          animation: gradient-shift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 15px #ff6b2b33; }
          50% { box-shadow: 0 0 25px #ff6b2b55; }
        }
        .glow-badge {
          animation: badge-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════ */}
      <section style={styles.hero}>
        <EmberParticles />
        <div style={styles.heroContent}>
          <Reveal>
            <div style={styles.heroBadge} className="glow-badge">
              <span style={styles.heroBadgeIcon}>⚡</span>
              <span style={styles.heroBadgeText}>Open Source · MIT Licensed · Free Forever</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 style={styles.heroTitle}>
              <span className="gradient-text">Your Guitar.</span>
              <br />
              <span style={styles.heroTitleWhite}>Your Browser.</span>
              <br />
              <span style={styles.heroTitleEmber}>No Excuses.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p style={styles.heroDescription}>
              FretForge is a free, open-source guitar learning companion that runs
              entirely in your browser. Real-time pitch detection, interactive chord
              diagrams, randomized practice sessions, and progress tracking — powered
              by the Web Audio API. No downloads. No subscriptions. Just plug in and play.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div style={styles.heroCtas}>
              <Link to="/tuner" style={styles.ctaPrimary}>
                <span>🎵</span> Start Tuning — It's Free
              </Link>
              <a
                href="https://github.com/TzvetomirTodorov/FretForge"
                target="_blank"
                rel="noreferrer"
                style={styles.ctaSecondary}
              >
                <span>⚡</span> View on GitHub
              </a>
            </div>
          </Reveal>

          {/* Personalized welcome for logged-in users */}
          {isAuthenticated && (
            <Reveal delay={0.35}>
              <div style={styles.welcomeBack}>
                Welcome back, <strong>{user.username}</strong> — Level {user.level} · {user.xp} XP · 🔥 {user.currentStreak} day streak
              </div>
            </Reveal>
          )}

          {/* String visualization hero element */}
          <Reveal delay={0.4}>
            <StringViz />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════════════ */}
      <section style={styles.statsSection}>
        <div style={styles.statsInner}>
          <StatItem value="18" label="Chords" delay={0} />
          <div style={styles.statDivider} />
          <StatItem value="6" label="Scale Patterns" delay={0.1} />
          <div style={styles.statDivider} />
          <StatItem value="13" label="Progressions" delay={0.2} />
          <div style={styles.statDivider} />
          <StatItem value="9" label="Achievements" delay={0.3} />
          <div style={styles.statDivider} />
          <StatItem value="100%" label="Free" delay={0.4} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURES GRID
          ═══════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <Reveal>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTag}>FEATURES</span>
              <h2 style={styles.sectionTitle}>Everything you need to level up</h2>
              <p style={styles.sectionSubtitle}>
                Six tools designed to take you from your first Em to barre chords and beyond,
                all running client-side with zero latency.
              </p>
            </div>
          </Reveal>

          <div style={styles.featuresGrid}>
            <FeatureCard
              icon="🎵" title="Chromatic Tuner"
              description="Real-time pitch detection with sub-cent accuracy. An SVG gauge shows exactly how far off you are — green means go. Uses autocorrelation on raw microphone audio, no external servers."
              accent="#00ff9f" delay={0}
            />
            <FeatureCard
              icon="🤘" title="Chord Library"
              description="18 chords across 4 difficulty tiers with interactive fretboard diagrams. See finger positions, learn tips for each chord, and follow curated progressions from beginner to advanced."
              accent="#ff6b2b" delay={0.1}
            />
            <FeatureCard
              icon="🔥" title="Practice Engine"
              description="Random chord progressions at your skill level. FretForge listens through your mic and scores each chord change in real-time. Miss a chord? It'll tell you what you played instead."
              accent="#ff2d6b" delay={0.2}
            />
            <FeatureCard
              icon="🎼" title="Scale Patterns"
              description="Pentatonic, blues, major, and minor scale boxes displayed on an interactive fretboard. Root notes highlighted, intervals labeled, and tips for each pattern."
              accent="#a855f7" delay={0.1}
            />
            <FeatureCard
              icon="⏱" title="Metronome"
              description="Sample-accurate BPM metronome using AudioContext clock scheduling — not setInterval. Zero drift, ever. Adjustable time signatures and distinct downbeat accents."
              accent="#02d7f2" delay={0.2}
            />
            <FeatureCard
              icon="📊" title="Progress Tracking"
              description="XP system, daily streaks, 9 unlockable achievement badges, per-chord mastery percentages, and session history. Sign up to save your progress across devices."
              accent="#ffb000" delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════ */}
      <section style={{ ...styles.section, background: "#080c14" }}>
        <div style={styles.sectionInner}>
          <Reveal>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTag}>HOW IT WORKS</span>
              <h2 style={styles.sectionTitle}>From zero to playing in three clicks</h2>
            </div>
          </Reveal>

          <div style={styles.stepsGrid}>
            {[
              { num: "01", title: "Open FretForge", desc: "No install, no signup required. Just open your browser and go to the tuner page.", icon: "🌐" },
              { num: "02", title: "Allow your mic", desc: "FretForge needs your microphone to hear your guitar. All processing happens locally in your browser — nothing is sent to any server.", icon: "🎤" },
              { num: "03", title: "Play and learn", desc: "Strum a string and watch the tuner respond. Move to the chord library, then the practice engine. Your skills compound every day.", icon: "🎸" },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 0.15}>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>{step.num}</div>
                  <span style={{ fontSize: "28px" }}>{step.icon}</span>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepDesc}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TECH STACK
          ═══════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <Reveal>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTag}>BUILT WITH</span>
              <h2 style={styles.sectionTitle}>The PERN Stack + Web Audio API</h2>
              <p style={styles.sectionSubtitle}>
                A modern, full-stack architecture designed for real-time audio processing
                and gamified progress tracking.
              </p>
            </div>
          </Reveal>

          <div style={styles.techGrid}>
            {[
              { name: "React 18", desc: "Component-driven UI with hooks", color: "#61dafb" },
              { name: "Web Audio API", desc: "Real-time pitch detection", color: "#ff6b2b" },
              { name: "Express", desc: "REST API with JWT auth", color: "#00ff9f" },
              { name: "PostgreSQL", desc: "Progress & session storage", color: "#336791" },
              { name: "Prisma", desc: "Type-safe database ORM", color: "#a855f7" },
              { name: "Vite", desc: "Lightning-fast dev server", color: "#ffb000" },
            ].map((tech, i) => (
              <Reveal key={tech.name} delay={i * 0.08}>
                <div style={styles.techCard}>
                  <div style={{ ...styles.techDot, background: tech.color }} />
                  <div>
                    <span style={{ ...styles.techName, color: tech.color }}>{tech.name}</span>
                    <span style={styles.techDesc}>{tech.desc}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          OPEN SOURCE CTA
          ═══════════════════════════════════════════════════ */}
      <section style={{ ...styles.section, background: "#080c14" }}>
        <div style={styles.sectionInner}>
          <Reveal>
            <div style={styles.ossBanner}>
              <div style={styles.ossTerminal}>
                <div style={styles.ossTerminalDots}>
                  <span style={{ ...styles.ossDot, background: "#ff5f57" }} />
                  <span style={{ ...styles.ossDot, background: "#febc2e" }} />
                  <span style={{ ...styles.ossDot, background: "#28c840" }} />
                </div>
                <div style={styles.ossCode}>
                  <span style={{ color: "#475569" }}>$</span>{" "}
                  <span style={{ color: "#ff6b2b" }}>git clone</span>{" "}
                  <span style={{ color: "#ffb000" }}>https://github.com/TzvetomirTodorov/FretForge.git</span>
                  <br />
                  <span style={{ color: "#475569" }}>$</span>{" "}
                  <span style={{ color: "#00ff9f" }}>cd</span>{" "}
                  FretForge && npm install
                  <br />
                  <span style={{ color: "#475569" }}>$</span>{" "}
                  <span style={{ color: "#02d7f2" }}>npm run dev</span>
                  <br />
                  <br />
                  <span style={{ color: "#00ff9f" }}>🔥 FretForge running on localhost:5173</span>
                </div>
              </div>

              <div style={styles.ossContent}>
                <h2 style={styles.ossTitle}>Open Source, Always Free</h2>
                <p style={styles.ossDesc}>
                  FretForge is MIT licensed. Fork it, extend it, contribute back.
                  Built by a guitarist who got tired of paying $15/month for a metronome
                  wrapped in a subscription paywall.
                </p>
                <div style={styles.ossCtas}>
                  <a
                    href="https://github.com/TzvetomirTodorov/FretForge"
                    target="_blank"
                    rel="noreferrer"
                    style={styles.ctaPrimary}
                  >
                    ⚡ Star on GitHub
                  </a>
                  {!isAuthenticated && (
                    <Link to="/auth" style={styles.ctaSecondary}>
                      Create Free Account
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════ */}
      <section style={styles.finalCta}>
        <EmberParticles />
        <Reveal>
          <div style={styles.finalCtaInner}>
            <h2 style={styles.finalCtaTitle}>
              Ready to <span className="gradient-text">forge</span> your skills?
            </h2>
            <p style={styles.finalCtaDesc}>
              Pick up your guitar. Open the tuner. Start playing.
            </p>
            <Link to="/tuner" style={{ ...styles.ctaPrimary, fontSize: "16px", padding: "16px 40px" }}>
              🎵 Launch the Tuner
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  page: {
    overflow: "hidden", // Prevent horizontal scroll from animations
  },

  // ─── Embers ────────
  emberContainer: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 0,
  },

  // ─── Hero ──────────
  hero: {
    position: "relative",
    padding: "80px 24px 40px",
    minHeight: "90vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(ellipse at 50% 0%, #1a0a0044 0%, #0a0e17 70%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "720px",
    width: "100%",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 18px",
    background: "#ff6b2b11",
    border: "1px solid #ff6b2b33",
    borderRadius: "100px",
    marginBottom: "28px",
  },
  heroBadgeIcon: { fontSize: "13px" },
  heroBadgeText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: "600",
    color: "#ff6b2b",
    letterSpacing: "0.3px",
  },
  heroTitle: {
    fontSize: "clamp(36px, 7vw, 64px)",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "700",
    lineHeight: "1.1",
    margin: "0 0 24px",
    letterSpacing: "-1px",
  },
  heroTitleWhite: { color: "#e2e8f0" },
  heroTitleEmber: { color: "#ff6b2b" },
  heroDescription: {
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#94a3b8",
    maxWidth: "540px",
    margin: "0 auto 32px",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  heroCtas: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    background: "linear-gradient(135deg, #ff6b2b, #ffb000)",
    borderRadius: "8px",
    color: "#0a0e17",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "14px",
    fontWeight: "700",
    textDecoration: "none",
    transition: "all 0.2s ease",
    border: "none",
    cursor: "pointer",
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    background: "transparent",
    border: "1px solid #ff6b2b44",
    borderRadius: "8px",
    color: "#ff6b2b",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  welcomeBack: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#00ff9f11",
    border: "1px solid #00ff9f33",
    borderRadius: "8px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    color: "#00ff9f",
    marginBottom: "24px",
  },

  // ─── String Viz ────
  stringViz: {
    maxWidth: "500px",
    margin: "32px auto 0",
    padding: "24px 20px 16px",
    background: "#111827",
    border: "1px solid #1a233266",
    borderRadius: "12px",
  },
  stringRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "6px",
  },
  stringLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    fontWeight: "700",
    width: "16px",
    textAlign: "center",
  },
  stringLineWrapper: {
    flex: 1,
    position: "relative",
    height: "12px",
    display: "flex",
    alignItems: "center",
  },
  stringLine: {
    width: "100%",
    borderRadius: "4px",
    transformOrigin: "center",
  },
  fretMarker: {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    transform: "translateX(-50%)",
    transition: "all 0.3s ease",
  },
  stringVizCaption: {
    textAlign: "center",
    marginTop: "12px",
  },

  // ─── Stats Bar ─────
  statsSection: {
    padding: "0 24px",
    background: "#080c14",
    borderTop: "1px solid #ff6b2b11",
    borderBottom: "1px solid #ff6b2b11",
  },
  statsInner: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "32px",
    padding: "28px 0",
    flexWrap: "wrap",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
  },
  statLabel: {
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
    letterSpacing: "1px",
    fontWeight: "600",
  },
  statDivider: {
    width: "1px",
    height: "36px",
    background: "#1a2332",
  },

  // ─── Section Layout ──
  section: {
    padding: "80px 24px",
  },
  sectionInner: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "48px",
  },
  sectionTag: {
    display: "inline-block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#ff6b2b",
    marginBottom: "12px",
    padding: "4px 12px",
    background: "#ff6b2b11",
    borderRadius: "4px",
  },
  sectionTitle: {
    fontSize: "clamp(24px, 4vw, 36px)",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: "0 0 12px",
  },
  sectionSubtitle: {
    fontSize: "15px",
    color: "#94a3b8",
    maxWidth: "520px",
    margin: "0 auto",
    lineHeight: "1.6",
  },

  // ─── Features ──────
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  featureCard: {
    position: "relative",
    padding: "28px 24px",
    background: "#111827",
    border: "1px solid",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  featureIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    fontSize: "22px",
    marginBottom: "16px",
  },
  featureTitle: {
    fontSize: "17px",
    fontWeight: "600",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: "0 0 8px",
  },
  featureDesc: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.6",
    margin: 0,
  },
  featureAccent: {
    position: "absolute",
    bottom: 0,
    left: "10%",
    right: "10%",
    height: "2px",
    borderRadius: "2px 2px 0 0",
    opacity: 0.5,
  },

  // ─── Steps ─────────
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  stepCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
    padding: "32px 24px",
    background: "#0d1220",
    border: "1px solid #1a233244",
    borderRadius: "12px",
  },
  stepNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "32px",
    fontWeight: "700",
    color: "#ff6b2b22",
    lineHeight: 1,
  },
  stepTitle: {
    fontSize: "17px",
    fontWeight: "600",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: 0,
  },
  stepDesc: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.6",
    margin: 0,
  },

  // ─── Tech Stack ────
  techGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  techCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    background: "#111827",
    border: "1px solid #1a233244",
    borderRadius: "8px",
  },
  techDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  techName: {
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    fontWeight: "600",
  },
  techDesc: {
    display: "block",
    fontSize: "11px",
    color: "#475569",
    fontFamily: "'JetBrains Mono', monospace",
  },

  // ─── OSS Banner ────
  ossBanner: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    alignItems: "center",
  },
  ossTerminal: {
    width: "100%",
    maxWidth: "600px",
    background: "#0d1220",
    border: "1px solid #1a233266",
    borderRadius: "12px",
    overflow: "hidden",
  },
  ossTerminalDots: {
    display: "flex",
    gap: "6px",
    padding: "12px 16px",
    borderBottom: "1px solid #1a233244",
  },
  ossDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  ossCode: {
    padding: "20px 20px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    color: "#e2e8f0",
    lineHeight: "1.8",
    overflowX: "auto",
  },
  ossContent: {
    textAlign: "center",
    maxWidth: "500px",
  },
  ossTitle: {
    fontSize: "28px",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: "0 0 12px",
  },
  ossDesc: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.7",
    margin: "0 0 24px",
  },
  ossCtas: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  // ─── Final CTA ─────
  finalCta: {
    position: "relative",
    padding: "80px 24px",
    textAlign: "center",
    background: "radial-gradient(ellipse at 50% 100%, #1a0a0044 0%, #0a0e17 70%)",
  },
  finalCtaInner: {
    position: "relative",
    zIndex: 1,
  },
  finalCtaTitle: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: "0 0 12px",
  },
  finalCtaDesc: {
    fontSize: "16px",
    color: "#94a3b8",
    margin: "0 0 28px",
    fontFamily: "'Space Grotesk', sans-serif",
  },
};
