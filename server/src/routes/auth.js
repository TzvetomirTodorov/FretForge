// ═══════════════════════════════════════════════════════════════
//  FretForge — Auth Routes
//  POST /api/auth/register — Create account
//  POST /api/auth/login — Get JWT token
//  GET  /api/auth/me — Get current user profile (protected)
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ─── Validation Schemas ──────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email().max(255).transform((e) => e.toLowerCase().trim()),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Username: letters, numbers, hyphens, underscores only"),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1),
});

// ─── POST /register ──────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check for existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      return res.status(409).json({
        error: existing.email === data.email ? "Email already registered" : "Username already taken",
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, username: data.username, password: hashedPassword },
      select: { id: true, email: true, username: true, xp: true, level: true, createdAt: true },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user, token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ─── POST /login ─────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        skillTier: user.skillTier,
      },
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── GET /me ─────────────────────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, username: true,
        xp: true, level: true, currentStreak: true, longestStreak: true,
        skillTier: true, preferredBpm: true, lastPractice: true,
        createdAt: true,
        _count: { select: { sessions: true, achievements: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;
