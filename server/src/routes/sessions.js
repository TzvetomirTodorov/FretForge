// ═══════════════════════════════════════════════════════════════
//  FretForge — Practice Session Routes
//  POST /api/sessions — Start a new practice session
//  PATCH /api/sessions/:id/end — End a session with results
//  GET /api/sessions — List user's sessions with pagination
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// All session routes require authentication
router.use(authenticate);

// ─── POST / — Start a new session ───────────────────────────
router.post("/", async (req, res) => {
  try {
    const { type, bpm, progression } = req.body;

    const session = await prisma.practiceSession.create({
      data: {
        userId: req.userId,
        type: type || "chord_practice",
        bpm: bpm || null,
        progression: progression ? JSON.stringify(progression) : null,
      },
    });

    res.status(201).json({ session });
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// ─── PATCH /:id/end — End a session with results ────────────
router.patch("/:id/end", async (req, res) => {
  try {
    const { totalChords, correctChords } = req.body;

    // Calculate XP: 10 per correct chord + 5 bonus per 80%+ accuracy
    const accuracy = totalChords > 0 ? correctChords / totalChords : 0;
    const xpEarned = (correctChords * 10) + (accuracy >= 0.8 ? totalChords * 5 : 0);

    const session = await prisma.practiceSession.update({
      where: { id: req.params.id },
      data: {
        endedAt: new Date(),
        totalChords: totalChords || 0,
        correctChords: correctChords || 0,
        xpEarned,
      },
    });

    // Update user XP and streak
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const now = new Date();
    const lastPractice = user.lastPractice ? new Date(user.lastPractice) : null;

    // Streak logic: practiced yesterday = continue streak, else reset to 1
    let newStreak = 1;
    if (lastPractice) {
      const diffHours = (now - lastPractice) / (1000 * 60 * 60);
      if (diffHours < 48) {
        newStreak = user.currentStreak + 1;
      }
    }

    // Level up every 1000 XP
    const newXp = user.xp + xpEarned;
    const newLevel = Math.floor(newXp / 1000) + 1;

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        xp: newXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak),
        lastPractice: now,
      },
    });

    res.json({ session, xpEarned, newStreak, newLevel, newXp });
  } catch (err) {
    console.error("End session error:", err);
    res.status(500).json({ error: "Failed to end session" });
  }
});

// ─── GET / — List sessions (paginated) ──────────────────────
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.practiceSession.findMany({
        where: { userId: req.userId },
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.practiceSession.count({ where: { userId: req.userId } }),
    ]);

    res.json({ sessions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("List sessions error:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

module.exports = router;
