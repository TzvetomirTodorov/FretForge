#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  FretForge — Tuner Feature Scaffold Commits
#  Run from the FretForge repo root
#  Usage: bash scaffold-tuner.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "🎵 FretForge — Scaffolding Tuner Feature..."
echo "============================================="

# ─── Commit 1: TuningMeter SVG component ──
echo ""
echo "📦 Commit 1/4: TuningMeter component"
git add client/src/components/audio/TuningMeter.jsx
git commit -m "feat(tuner): add TuningMeter SVG gauge component

- 240° arc gauge mapping ±50 cents to needle position
- Color-coded feedback: green (±5 cents), amber (±15), red (beyond)
- SVG glow filters for active note and in-tune state
- Tick marks at 10-cent intervals with major labels at ±25 and ±50
- Smooth CSS transitions on needle movement (120ms easing)
- Displays detected note, octave, cents offset, and status label
- Centered green zone indicator for the ±5 cent 'in tune' target"

# ─── Commit 2: StringDisplay component ──
echo ""
echo "📦 Commit 2/4: StringDisplay component"
git add client/src/components/audio/StringDisplay.jsx
git commit -m "feat(tuner): add StringDisplay with nearest-string detection

- Shows all 6 strings in standard tuning (E A D G B E)
- Highlights the string closest to the detected frequency
- FretForge string color identity system (magenta through purple)
- Per-string tuning indicator: ✓ (in tune), ↑ (tune up), ↓ (tune down)
- Decorative string lines with proportional thickness (6px low E to 1px high E)
- 200-cent matching threshold for string detection
- Smooth scale/glow transitions on matched string card"

# ─── Commit 3: TunerPage with full audio pipeline ──
echo ""
echo "📦 Commit 3/4: TunerPage — complete chromatic tuner"
git add client/src/pages/TunerPage.jsx
git commit -m "feat(tuner): add TunerPage composing full audio pipeline into working tuner

- Composes useAudio + usePitch + TuningMeter + StringDisplay
- Note hold buffer (80ms) prevents rapid flickering between harmonics
- 400ms decay timeout clears display when guitar stops ringing
- Frequency, clarity percentage, and live status readout bar
- Start/Stop button toggles microphone and pitch detection
- How-to-tune guide with 4-step instructions
- Standard tuning reference table (A440)
- Responsive layout capped at 680px max width"

# ─── Commit 4: Wire up App.jsx and add layout CSS ──
echo ""
echo "📦 Commit 4/4: Connect TunerPage to router and add layout styles"
git add client/src/App.jsx client/src/styles/index.css
git commit -m "feat(app): wire TunerPage into router and add navigation/layout CSS

- Import TunerPage and replace placeholder on /tuner route
- Add sticky navigation with responsive mobile hamburger menu
- Add hero section, features grid, and footer layout styles
- Mobile breakpoint at 640px hides desktop nav, shows hamburger
- All styles use the FretForge CSS variable design system"

echo ""
echo "============================================="
echo "🎵 Tuner feature scaffolded!"
echo "   4 atomic commits ready."
echo ""
echo "Push with: git push"
echo ""
echo "Then visit: http://localhost:5173/tuner"
echo "Or your Vercel URL: https://fret-forge-client.vercel.app/tuner"
