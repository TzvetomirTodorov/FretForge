#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  FretForge — SPA Routing Fix + Landing Page Redesign
#  Run from the FretForge repo root
#  Usage: bash scaffold-landing.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "🎸 FretForge — Scaffolding SPA Fix + Landing Page..."
echo "======================================================"

# ─── Commit 1: Vercel SPA routing fix ──
echo ""
echo "📦 Commit 1/3: Fix Vercel SPA routing"
git add client/vercel.json
git commit -m "fix(deploy): add vercel.json rewrites for SPA client-side routing

Direct navigation to /tuner (or any non-root route) returned 404 because
Vercel tried to serve a file at that path. The rewrite rule sends all
requests to index.html so React Router handles routing client-side.

This is the standard fix for any SPA deployed to Vercel."

# ─── Commit 2: Landing page component ──
echo ""
echo "📦 Commit 2/3: Add animated landing page"
git add client/src/pages/LandingPage.jsx
git commit -m "feat(landing): add animated landing page with scroll reveals and ember particles

- CSS-only ember particle system (20 particles, rise animation, no JS overhead)
- IntersectionObserver scroll-reveal hook for fade/slide-in sections
- Animated guitar string visualization showing Em chord with per-string colors
- Hero with animated gradient text, badge, and dual CTA buttons
- Stats bar (18 chords, 6 scales, 13 progressions, 9 achievements, 100% free)
- 6-card feature grid with accent-colored bottom borders and icon badges
- 3-step 'How it Works' section (open, allow mic, play)
- Tech stack grid (React, Web Audio, Express, PostgreSQL, Prisma, Vite)
- Terminal-styled open source banner with git clone instructions
- Final CTA section with ember particles and gradient text
- Personalized welcome banner for authenticated users
- Fully responsive with clamp() typography"

# ─── Commit 3: Wire landing page into App.jsx ──
echo ""
echo "📦 Commit 3/3: Replace inline Home with LandingPage component"
git add client/src/App.jsx
git commit -m "refactor(app): use dedicated LandingPage component for home route

Replace the 80-line inline Home function with an import of the new
LandingPage component. Cleaner separation of concerns and makes
App.jsx focused purely on routing and layout."

echo ""
echo "======================================================"
echo "🎸 Landing page scaffolded!"
echo "   3 atomic commits ready."
echo ""
echo "Push with: git push"
echo ""
echo "Direct navigation to /tuner will now work on Vercel."
