#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  FretForge — Scaffold Commits Script
#  Run from the FretForge repo root after copying all files in
#  Usage: bash scaffold-commits.sh
# ═══════════════════════════════════════════════════════════════

set -e # Exit on any error

echo "🔥 FretForge — Scaffolding atomic commits..."
echo "============================================="

# ─── Commit 1: Project root — README, gitignore, workspace config ──
echo ""
echo "📦 Commit 1/8: Project root files"
git add README.md .gitignore package.json
git commit -m "chore: initialize FretForge monorepo with README and workspace config

- Add comprehensive README with architecture, roadmap, and audio pipeline docs
- Configure npm workspaces for client + server monorepo
- Add .gitignore for Node, Vite, Prisma, and environment files"

# ─── Commit 2: Server foundation — Express + Prisma setup ──
echo ""
echo "📦 Commit 2/8: Server foundation"
git add server/package.json server/.env.example server/prisma/schema.prisma server/src/utils/prisma.js server/src/index.js
git commit -m "feat(server): add Express server with Prisma schema and health check

- PostgreSQL schema: Users, PracticeSessions, ChordProgress, ScaleProgress, Achievements
- Prisma singleton pattern (prevents connection pool exhaustion)
- Express server with CORS, helmet, graceful shutdown
- Health check endpoint at GET /api/health"

# ─── Commit 3: Server auth — JWT registration and login ──
echo ""
echo "📦 Commit 3/8: Authentication system"
git add server/src/routes/auth.js server/src/middleware/auth.js
git commit -m "feat(server): add JWT auth with register, login, and profile endpoints

- POST /api/auth/register with Zod validation and bcrypt hashing
- POST /api/auth/login with JWT token generation (7-day expiry)
- GET /api/auth/me (protected) with user stats
- Auth middleware with optional auth variant for public routes"

# ─── Commit 4: Server routes — Sessions and progress tracking ──
echo ""
echo "📦 Commit 4/8: Practice sessions and progress API"
git add server/src/routes/sessions.js server/src/routes/progress.js
git commit -m "feat(server): add practice session and chord progress endpoints

- POST/GET /api/sessions — create and list practice sessions
- PATCH /api/sessions/:id/end — end session with XP calculation
- POST /api/progress/chords/:name — record chord attempts with mastery tracking
- GET /api/progress/achievements — achievement system with 9 unlockable badges
- Streak logic: 48-hour window for consecutive day tracking
- XP system: 10 per correct chord, bonus at 80%+ accuracy, level up every 1000 XP"

# ─── Commit 5: Client foundation — Vite + React shell ──
echo ""
echo "📦 Commit 5/8: Client foundation"
git add client/package.json client/vite.config.js client/index.html client/.env.example client/src/main.jsx client/src/styles/index.css
git commit -m "feat(client): initialize Vite + React app with FretForge design system

- Vite config with API proxy for development
- CSS design system: dark forge theme with ember accents
- String-color identity system (each guitar string has its own color)
- JetBrains Mono + Space Grotesk typography
- Responsive foundation with custom scrollbar and selection styles"

# ─── Commit 6: Client data — Chord and scale libraries ──
echo ""
echo "📦 Commit 6/8: Chord and scale data libraries"
git add client/src/data/chords.js client/src/data/scales.js
git commit -m "feat(client): add comprehensive chord and scale data libraries

- 18 chords across 4 difficulty tiers (open, 7ths, barre, power)
- Each chord: fingering positions, notes, finger assignments, tips
- 6 scale patterns: pentatonic (open + movable), blues, major, minor
- 6 practice progressions organized by difficulty
- Standard tuning reference with frequencies
- Note frequency calculator and frequency-to-note converter
- Chord progressions: beginner (6), intermediate (5), advanced (2)"

# ─── Commit 7: Client hooks — Audio, pitch detection, metronome ──
echo ""
echo "📦 Commit 7/8: Web Audio API hooks"
git add client/src/hooks/useAudio.js client/src/hooks/usePitch.js client/src/hooks/useMetronome.js
git commit -m "feat(client): add Web Audio API hooks for mic input, pitch detection, and metronome

- useAudio: microphone access with raw audio settings (no echo cancellation/noise suppression)
  - AudioContext + AnalyserNode pipeline, frequency and time-domain data extraction
- usePitch: autocorrelation-based pitch detection with parabolic interpolation
  - Guitar frequency range (70-1400Hz), clarity threshold, note identification
- useMetronome: sample-accurate BPM metronome using AudioContext clock scheduling
  - Lookahead scheduling prevents JavaScript timer drift
  - Configurable BPM and time signature, downbeat accent"

# ─── Commit 8: Client app — Router, pages, and layout ──
echo ""
echo "📦 Commit 8/8: Application shell with routing"
git add client/src/App.jsx
git commit -m "feat(client): add React Router shell with home, tuner, chords, practice, and scales pages

- Navigation with desktop and mobile responsive layouts
- Home page with feature cards and open-source banner
- Placeholder pages for Phase 1 features (tuner, chords, practice, scales)
- Footer with tech stack attribution
- API_URL configuration from VITE_API_URL environment variable"

# ─── Done! ────────────────────────────────────────────────────
echo ""
echo "============================================="
echo "🔥 FretForge scaffold complete!"
echo "   8 atomic commits pushed to your local repo."
echo ""
echo "Next steps:"
echo "  1. Create the GitHub repo: https://github.com/new"
echo "     Name: FretForge"
echo "     Description: Open-source browser-based guitar learning companion with real-time audio feedback"
echo "     Visibility: Public"
echo "     Do NOT initialize with README (we already have one)"
echo ""
echo "  2. Add the remote and push:"
echo "     git remote add origin https://github.com/TzvetomirTodorov/FretForge.git"
echo "     git branch -M main"
echo "     git push -u origin main"
echo ""
echo "  3. Install dependencies:"
echo "     npm install"
echo ""
echo "  4. Set up the database:"
echo "     cp server/.env.example server/.env"
echo "     # Edit server/.env with your PostgreSQL connection string"
echo "     cd server && npx prisma migrate dev --name init"
echo ""
echo "  5. Start developing:"
echo "     npm run dev"
echo ""
echo "Nothing but green lights ahead 🎸🐾"
