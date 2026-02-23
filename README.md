# 🎸 FretForge

**An open-source, browser-based guitar learning companion with real-time audio feedback.**

FretForge listens to you play through your browser's microphone, displays chord diagrams and scale patterns on an interactive fretboard, generates randomized practice progressions, and tracks your progress over time. No app store. No subscription. Just you, your guitar, and the Web Audio API.

---

## Why FretForge?

Every guitar learning app in 2025 is either subscription-locked ($10-20/month), desktop-only, or lacks real-time audio detection. FretForge fills the gap: a **free, browser-based PWA** that generates chord practice exercises and confirms you're playing them correctly — using pitch detection and chromagram analysis running entirely in your browser.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Audio | Web Audio API + AudioWorklet |
| Pitch Detection | pitchy (McLeod Pitch Method) |
| Chord Recognition | Meyda.js (chromagram extraction) |
| Hosting | Vercel (client) + Railway (server + DB) |

## Features (Roadmap)

### Phase 1 — Foundation (MVP)
- [ ] Interactive fretboard display (SVG/Canvas)
- [ ] Chord diagram library (open chords, barre chords, power chords)
- [ ] Microphone input with real-time pitch detection
- [ ] Guitar tuner (chromatic)
- [ ] Metronome with configurable BPM and time signatures

### Phase 2 — Practice Engine
- [ ] Random chord progression generator (configurable difficulty)
- [ ] Chord flash cards with audio detection validation
- [ ] Scale pattern display with backing track integration
- [ ] Strumming pattern visualizer
- [ ] Practice session timer and streak tracking

### Phase 3 — Gamification & Progress
- [ ] User accounts with practice history
- [ ] XP system: earn points for correct chord transitions
- [ ] Achievement badges (first barre chord, 7-day streak, etc.)
- [ ] Difficulty tiers: Beginner → Intermediate → Advanced
- [ ] Leaderboards (optional, community-driven)

### Phase 4 — Advanced Audio
- [ ] Full chord recognition via chromagram template matching
- [ ] Real-time feedback: "You played Am, expected C — try again"
- [ ] Song mode: follow along with chord charts synced to tempo
- [ ] AI-generated mini-songs from chord progressions
- [ ] MIDI input support for players with MIDI pickups

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/TzvetomirTodorov/FretForge.git
cd FretForge

# Install all dependencies (client + server)
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your PostgreSQL connection string

# Run database migrations
cd server && npx prisma migrate dev --name init && cd ..

# Start both client and server in development mode
npm run dev
```

### Environment Variables

**Server (`server/.env`)**
```
DATABASE_URL="postgresql://user:password@localhost:5432/fretforge?schema=public"
PORT=3001
JWT_SECRET="your-secret-here"
CLIENT_URL="http://localhost:5173"
```

**Client (`client/.env`)**
```
VITE_API_URL="http://localhost:3001"
```

## Project Structure

```
FretForge/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── audio/        # Microphone, pitch detection, tuner
│   │   │   ├── fretboard/    # Interactive fretboard display
│   │   │   ├── chords/       # Chord diagrams and flash cards
│   │   │   ├── practice/     # Practice engine, metronome, sessions
│   │   │   └── ui/           # Shared UI components
│   │   ├── hooks/            # Custom React hooks (useAudio, usePitch, etc.)
│   │   ├── utils/            # Audio analysis, chord matching, helpers
│   │   ├── data/             # Chord/scale definitions, tuning configs
│   │   ├── pages/            # Route-level page components
│   │   └── styles/           # Global styles, theme, CSS variables
│   └── public/
├── server/                   # Express API
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/        # Auth, rate limiting, validation
│   │   └── utils/            # Prisma singleton, helpers
│   └── .env.example
├── package.json              # Workspace root
└── README.md
```

## Audio Architecture

FretForge's audio pipeline runs entirely in the browser:

```
Microphone → getUserMedia() → AnalyserNode → AudioWorklet
                                    ↓
                            FFT (frequency data)
                                    ↓
                    ┌───────────────┴───────────────┐
                    │                               │
              Pitch Detection                 Chromagram Extraction
              (pitchy library)                (Meyda.js chroma)
                    │                               │
              Single Note ID                  12-dim chroma vector
              (tuner, scales)                       │
                                            Chord Template Matching
                                                    │
                                            Detected Chord (Am, G, etc.)
```

**Critical browser config for clean audio input:**
```javascript
navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  }
});
```

## Contributing

FretForge is open source and welcomes contributions. Whether you're a guitarist who codes, a developer who plays, or someone who just wants to help build something cool — you're welcome here.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

## License

MIT — use it, fork it, learn from it, make it better.

## Author

**Tzvetomir Todorov** — Senior Full Stack Developer
- GitHub: [TzvetomirTodorov](https://github.com/TzvetomirTodorov)
- Portfolio: [tzvetomir.dev](https://tzvetomir.dev)
- LinkedIn: [tzvetomir-todorov](https://www.linkedin.com/in/tzvetomir-todorov-2a68a96a/)

---

*"Nothing but green lights ahead"* 🎸🐾
