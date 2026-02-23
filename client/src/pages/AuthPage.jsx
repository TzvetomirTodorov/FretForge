import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// ═══════════════════════════════════════════════════════════════
//  FretForge — Auth Page
//  Combined Login + Register with a tabbed interface
//  After successful auth, redirects to home page
//  Uses the AuthContext for all state management
// ═══════════════════════════════════════════════════════════════

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // ─── Switch between login/register ─────────────────────────
  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setLocalError(null);
    clearError();
    // Don't clear fields when switching — less annoying for the user
  }, [clearError]);

  // ─── Client-side validation ────────────────────────────────
  const validate = useCallback(() => {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email";

    if (mode === "register") {
      if (!username.trim()) return "Username is required";
      if (username.length < 3) return "Username must be at least 3 characters";
      if (username.length > 30) return "Username must be 30 characters or fewer";
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) return "Username can only contain letters, numbers, hyphens, and underscores";
    }

    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";

    if (mode === "register" && password !== confirmPassword) {
      return "Passwords don't match";
    }

    return null;
  }, [email, username, password, confirmPassword, mode]);

  // ─── Submit handler ────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim().toLowerCase(), password);
      } else {
        await register(email.trim().toLowerCase(), username.trim(), password);
      }
      navigate("/");
    } catch (err) {
      // Error is already set in AuthContext, but we can also show it locally
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [mode, email, username, password, validate, login, register, navigate, clearError]);

  const displayError = localError || authError;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <span style={styles.logoIcon}>🔥</span>
          <h1 style={styles.logoText}>FretForge</h1>
          <p style={styles.logoSubtitle}>
            {mode === "login" ? "Welcome back, guitarist" : "Join the forge"}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={styles.tabs}>
          <button
            onClick={() => switchMode("login")}
            style={{
              ...styles.tab,
              ...(mode === "login" ? styles.tabActive : {}),
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode("register")}
            style={{
              ...styles.tab,
              ...(mode === "register" ? styles.tabActive : {}),
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error display */}
        {displayError && (
          <div style={styles.errorBox}>
            <span style={{ fontSize: "14px" }}>⚠</span>
            <span>{displayError}</span>
          </div>
        )}

        {/* Auth form */}
        <div style={styles.formCard}>
          <div style={styles.form}>
            {/* Email field */}
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={styles.input}
                autoComplete="email"
                disabled={submitting}
              />
            </div>

            {/* Username field (register only) */}
            {mode === "register" && (
              <div style={styles.field}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="guitar_hero_42"
                  style={styles.input}
                  autoComplete="username"
                  disabled={submitting}
                  maxLength={30}
                />
                <span style={styles.hint}>3-30 characters. Letters, numbers, hyphens, underscores.</span>
              </div>
            )}

            {/* Password field */}
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                disabled={submitting}
              />
              {mode === "register" && (
                <span style={styles.hint}>Minimum 8 characters</span>
              )}
            </div>

            {/* Confirm password (register only) */}
            {mode === "register" && (
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                  autoComplete="new-password"
                  disabled={submitting}
                />
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                ...styles.submitButton,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? "Hold on..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </div>
        </div>

        {/* Prompt to switch mode */}
        <p style={styles.switchPrompt}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => switchMode("register")} style={styles.switchLink}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => switchMode("login")} style={styles.switchLink}>
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Feature teaser */}
        <div style={styles.features}>
          <p style={styles.featuresTitle}>Why create an account?</p>
          <div style={styles.featuresList}>
            <span style={styles.featureItem}>📊 Track your practice streaks</span>
            <span style={styles.featureItem}>⚡ Earn XP and level up</span>
            <span style={styles.featureItem}>🏆 Unlock achievement badges</span>
            <span style={styles.featureItem}>📈 See your chord mastery grow</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  },
  container: {
    width: "100%",
    maxWidth: "400px",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "28px",
  },
  logoIcon: {
    fontSize: "36px",
    display: "block",
    marginBottom: "4px",
  },
  logoText: {
    fontSize: "28px",
    fontWeight: "700",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    margin: "0 0 6px",
  },
  logoSubtitle: {
    fontSize: "13px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#94a3b8",
    margin: 0,
  },
  tabs: {
    display: "flex",
    gap: "4px",
    padding: "4px",
    background: "#111827",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  tab: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    borderRadius: "6px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "transparent",
    color: "#475569",
  },
  tabActive: {
    background: "#1a2332",
    color: "#ff6b2b",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 14px",
    background: "#ff2d6b11",
    border: "1px solid #ff2d6b33",
    borderRadius: "8px",
    color: "#ff2d6b",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    marginBottom: "16px",
  },
  formCard: {
    background: "#111827",
    border: "1px solid #1a233266",
    borderRadius: "10px",
    padding: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "11px 14px",
    background: "#0d1220",
    border: "1px solid #1a233288",
    borderRadius: "6px",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "14px",
    color: "#e2e8f0",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  hint: {
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
  },
  submitButton: {
    padding: "13px 0",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #ff6b2b, #ffb000)",
    color: "#0a0e17",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "14px",
    fontWeight: "700",
    transition: "all 0.2s ease",
    marginTop: "4px",
  },
  switchPrompt: {
    textAlign: "center",
    fontSize: "13px",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#475569",
    marginTop: "20px",
  },
  switchLink: {
    background: "none",
    border: "none",
    color: "#ff6b2b",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
    padding: 0,
  },
  features: {
    marginTop: "28px",
    textAlign: "center",
  },
  featuresTitle: {
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#475569",
    letterSpacing: "1px",
    fontWeight: "600",
    margin: "0 0 10px",
  },
  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  featureItem: {
    fontSize: "12px",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#94a3b8",
  },
};
