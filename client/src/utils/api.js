// ═══════════════════════════════════════════════════════════════
//  FretForge — API Utility
//  Centralized fetch wrapper for all server communication
//  Handles: base URL, auth tokens, JSON parsing, error formatting
//  AUDIT FIX: Previously each component would need to manually
//  construct fetch calls and handle tokens — this centralizes it
// ═══════════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Token is stored in localStorage for persistence across page refreshes
// We read it lazily on each request rather than caching it in a variable,
// because the token can change (login/logout) during the app's lifetime
function getToken() {
  return localStorage.getItem("fretforge_token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("fretforge_token", token);
  } else {
    localStorage.removeItem("fretforge_token");
  }
}

export function clearToken() {
  localStorage.removeItem("fretforge_token");
}

// ─── Core request function ───────────────────────────────────
// Every API call goes through here so auth headers, error handling,
// and base URL resolution happen in exactly one place
async function request(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      // Attach the JWT bearer token if the user is logged in
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // If there's a body and it's not already a string, serialize it
  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle 401 globally — token expired or invalid
    // Clear the token so the UI can react and show login
    if (response.status === 401) {
      clearToken();
      // Don't throw here for login/register attempts — they expect 401
      if (!endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
    }

    // Parse JSON response (or return null for 204 No Content)
    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      // Server returned an error — throw with the server's error message
      throw new ApiError(data?.error || `Request failed (${response.status})`, response.status, data);
    }

    return data;
  } catch (err) {
    // Re-throw ApiErrors as-is, wrap network errors
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || "Network error — check your connection", 0);
  }
}

// ─── Custom error class for API errors ───────────────────────
// Carries the HTTP status code so the UI can react differently
// to 400 (bad input) vs 409 (conflict) vs 500 (server error)
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ─── Convenience methods ─────────────────────────────────────
// These mirror the HTTP verbs and keep call sites clean:
//   const user = await api.get("/api/auth/me");
//   await api.post("/api/sessions", { type: "chord_practice" });

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) => request(endpoint, { method: "POST", body }),
  patch: (endpoint, body) => request(endpoint, { method: "PATCH", body }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default api;
