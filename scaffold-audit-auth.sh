#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  FretForge — Audit, Auth UI, and CSS Fixes
#  Run from the FretForge repo root
#  Usage: bash scaffold-audit-auth.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "🔒 FretForge — Scaffolding Audit + Auth + CSS Fixes..."
echo "======================================================="

# ─── Commit 1: CSS and visual fixes ──
echo ""
echo "📦 Commit 1/5: CSS and visual fixes"
git add client/public/fretforge-icon.svg client/src/components/audio/TuningMeter.jsx client/src/styles/index.css
git commit -m "fix(ui): resolve tuner text overlap, add favicon, add nav user menu CSS

- Fix TuningMeter note/cents/status text overlapping by spacing elements
  vertically (y offsets: +48, +76, +100) and expanding viewBox to 320
- Add fretforge-icon.svg favicon (fixes 404 in console)
- Add nav user dropdown, avatar, level badge, and auth link styles
- Add mobile user info section styles for responsive nav"

# ─── Commit 2: API utility and auth context ──
echo ""
echo "📦 Commit 2/5: API utility and auth context"
git add client/src/utils/api.js client/src/hooks/useAuth.js
git commit -m "feat(client): add centralized API utility and AuthContext

- api.js: Fetch wrapper with base URL, JWT token management, ApiError class
  Handles 401 globally with auth:expired event dispatch
  Convenience methods: api.get, api.post, api.patch, api.delete
- useAuth.js: React context providing user state, login, register, logout
  Auto-restores sessions from localStorage token on mount
  Listens for auth:expired events to sync UI state
  refreshUser() for re-fetching after XP changes"

# ─── Commit 3: Auth page UI ──
echo ""
echo "📦 Commit 3/5: Auth page with login/register"
git add client/src/pages/AuthPage.jsx
git commit -m "feat(auth): add combined Login/Register page with tabbed interface

- Tabbed Sign In / Create Account switcher
- Client-side validation (email format, username rules, password match)
- Real-time error display from both client validation and server responses
- Submitting state with button disable during API calls
- Feature teaser section (streaks, XP, achievements, mastery tracking)
- Post-auth redirect to home page
- Full FretForge design system styling"

# ─── Commit 4: App.jsx with auth integration ──
echo ""
echo "📦 Commit 4/5: Wire auth into app shell"
git add client/src/App.jsx
git commit -m "feat(app): integrate AuthProvider with auth-aware navigation

- Wrap entire app in AuthProvider for global auth state
- Nav shows user avatar + username + level badge when authenticated
- User dropdown menu with XP, streak, email, and sign out button
- Nav shows 'Sign In' link when not authenticated
- Home page hero shows personalized welcome when logged in
- Mobile nav includes auth section with user info and sign out
- /auth route added for the login/register page"

# ─── Commit 5: Server security hardening ──
echo ""
echo "📦 Commit 5/5: Server security audit fixes"
git add server/src/index.js server/src/routes/sessions.js
git commit -m "security(server): rate limiting, session ownership, CORS hardening

AUDIT FIXES:
- Add auth-specific rate limiter: 10 attempts per 15 min (brute force protection)
- Add global rate limiter: 100 req/min per IP (DDoS mitigation)
- PATCH /sessions/:id/end: verify session belongs to requesting user (IDOR fix)
- PATCH /sessions/:id/end: reject if session already ended (double-submit guard)
- CORS: support multiple origins (dev localhost + production Vercel)
- Reduce JSON body limit from 1mb to 100kb (attack surface reduction)
- Never leak stack traces in production error handler"

echo ""
echo "======================================================="
echo "🔒 Audit + Auth scaffolded!"
echo "   5 atomic commits ready."
echo ""
echo "Push with: git push"
echo ""
echo "Don't forget to run Prisma migration if you haven't:"
echo "  cd server && npx prisma migrate dev --name init"
