import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setToken, clearToken } from "../utils/api";

// ═══════════════════════════════════════════════════════════════
//  FretForge — Auth Context
//  Provides authentication state (user, token, loading) to the
//  entire component tree. Handles login, register, logout, and
//  automatic session restoration from localStorage on mount.
//
//  AUDIT: This is the single source of truth for "who is logged in."
//  Components never read localStorage directly — they consume
//  this context via the useAuth() hook.
// ═══════════════════════════════════════════════════════════════

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True on mount while we check for existing session
  const [error, setError] = useState(null);

  // ─── Restore session on mount ──────────────────────────────
  // If there's a token in localStorage from a previous session,
  // validate it by calling GET /api/auth/me. If it's expired or
  // invalid, we silently clear it and show the logged-out state.
  useEffect(() => {
    const token = localStorage.getItem("fretforge_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/api/auth/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        // Token is invalid or expired — clear it silently
        clearToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ─── Listen for token expiration events from the API utility ──
  // When a 401 happens on a non-auth endpoint, the api utility
  // dispatches "auth:expired" so we can update the UI state
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      clearToken();
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  // ─── Register ──────────────────────────────────────────────
  const register = useCallback(async (email, username, password) => {
    setError(null);
    try {
      const data = await api.post("/api/auth/register", { email, username, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ─── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await api.post("/api/auth/login", { email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ─── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
  }, []);

  // ─── Refresh user data ─────────────────────────────────────
  // Call this after actions that change user state (XP earned, etc.)
  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (err) {
      // If refresh fails, don't crash — just log it
      console.error("Failed to refresh user:", err);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshUser,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook for consuming auth context ─────────────────────────
// Usage: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
