// ═══════════════════════════════════════════════════════════════
//  FretForge — Progress Routes
//  GET /api/progress/chords — Get all chord mastery data
//  POST /api/progress/chords/:name — Update chord attempt results
//  GET /api/progress/achievements — Get unlocked achievements
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ─── Achievement Definitions ─────────────────────────────────
// Keys match the UserAchievement.achievementKey field
const ACHIEVEMENTS = {
  first_chord: { name: "First Chord!", description: "Play your first chord correctly", icon: "🎸", xpReward: 50 },
  ten_chords: { name: "Double Digits", description: "Master 10 different chords", icon: "🔟", xpReward: 200 },
  first_barre: { name: "Barre None", description: "Successfully play a barre chord", icon: "💪", xpReward: 150 },
  streak_3: { name: "Three-peat", description: "Practice 3 days in a row", icon: "🔥", xpReward: 100 },
  streak_7: { name: "Week Warrior", description: "Practice 7 days in a row", icon: "⚔️", xpReward: 300 },
  streak_30: { name: "Monthly Maestro", description: "Practice 30 days in a row", icon: "👑", xpReward: 1000 },
  perfect_session: { name: "Perfect Practice", description: "Get 100% accuracy in a session (10+ chords)", icon: "✨", xpReward: 200 },
  hundred_sessions: { name: "Centurion", description: "Complete 100 practice sessions", icon: "💯", xpReward: 500 },
  blues_master: { name: "Blues Brother", description: "Master all dominant 7th chords", icon: "🎵", xpReward: 250 },
};

// ─── GET /chords — All chord progress for this user ─────────
router.get("/chords", async (req, res) => {
  try {
    const progress = await prisma.chordProgress.findMany({
      where: { userId: req.userId },
      orderBy: { masteryPct: "desc" },
    });
    res.json({ progress });
  } catch (err) {
    console.error("Get chord progress error:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// ─── POST /chords/:name — Record a chord attempt ────────────
// Body: { success: boolean }
router.post("/chords/:name", async (req, res) => {
  try {
    const chordName = req.params.name;
    const { success } = req.body;

    // Upsert: create if first attempt, update if exists
    const existing = await prisma.chordProgress.findUnique({
      where: { userId_chordName: { userId: req.userId, chordName } },
    });

    let progress;
    if (existing) {
      const newAttempts = existing.attempts + 1;
      const newSuccesses = existing.successes + (success ? 1 : 0);
      const newStreak = success ? existing.bestStreak + 1 : 0;

      progress = await prisma.chordProgress.update({
        where: { id: existing.id },
        data: {
          attempts: newAttempts,
          successes: newSuccesses,
          masteryPct: newSuccesses / newAttempts,
          bestStreak: Math.max(newStreak, existing.bestStreak),
          lastPracticed: new Date(),
        },
      });
    } else {
      progress = await prisma.chordProgress.create({
        data: {
          userId: req.userId,
          chordName,
          attempts: 1,
          successes: success ? 1 : 0,
          masteryPct: success ? 1.0 : 0.0,
          bestStreak: success ? 1 : 0,
          lastPracticed: new Date(),
        },
      });
    }

    // Check for achievements after updating progress
    const newAchievements = await checkAchievements(req.userId);

    res.json({ progress, newAchievements });
  } catch (err) {
    console.error("Update chord progress error:", err);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// ─── GET /achievements — List all achievements ──────────────
router.get("/achievements", async (req, res) => {
  try {
    const unlocked = await prisma.userAchievement.findMany({
      where: { userId: req.userId },
      orderBy: { unlockedAt: "desc" },
    });

    // Merge with definitions so the client gets full info
    const achievements = Object.entries(ACHIEVEMENTS).map(([key, def]) => {
      const earned = unlocked.find((a) => a.achievementKey === key);
      return {
        key,
        ...def,
        unlocked: !!earned,
        unlockedAt: earned?.unlockedAt || null,
      };
    });

    res.json({ achievements });
  } catch (err) {
    console.error("Get achievements error:", err);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

// ─── Achievement Checker ─────────────────────────────────────
// Called after chord progress updates; returns newly unlocked achievements
async function checkAchievements(userId) {
  const newlyUnlocked = [];
  const existing = await prisma.userAchievement.findMany({ where: { userId } });
  const existingKeys = new Set(existing.map((a) => a.achievementKey));

  // Helper: unlock an achievement if not already earned
  async function unlock(key) {
    if (existingKeys.has(key)) return;
    await prisma.userAchievement.create({
      data: { userId, achievementKey: key },
    });
    // Award bonus XP
    if (ACHIEVEMENTS[key]?.xpReward) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: ACHIEVEMENTS[key].xpReward } },
      });
    }
    newlyUnlocked.push({ key, ...ACHIEVEMENTS[key] });
  }

  // Check: first chord mastered (>70% accuracy with 5+ attempts)
  const chordProgress = await prisma.chordProgress.findMany({ where: { userId } });
  const mastered = chordProgress.filter((c) => c.masteryPct >= 0.7 && c.attempts >= 5);
  if (mastered.length >= 1) await unlock("first_chord");
  if (mastered.length >= 10) await unlock("ten_chords");

  // Check: streak achievements
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.currentStreak >= 3) await unlock("streak_3");
  if (user.currentStreak >= 7) await unlock("streak_7");
  if (user.currentStreak >= 30) await unlock("streak_30");

  // Check: session count
  const sessionCount = await prisma.practiceSession.count({ where: { userId } });
  if (sessionCount >= 100) await unlock("hundred_sessions");

  return newlyUnlocked;
}

module.exports = router;
