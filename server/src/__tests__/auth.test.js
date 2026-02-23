// ═══════════════════════════════════════════════════════════════
//  FretForge — Auth Route Tests
//  Tests: POST /register, POST /login, GET /me
//  Uses mocked Prisma to avoid needing a real database
// ═══════════════════════════════════════════════════════════════

jest.mock("../../utils/prisma");

const request = require("supertest");
const bcrypt = require("bcryptjs");
const prisma = require("../../utils/prisma");
const { createTestApp, generateTestToken } = require("./helpers/app");

const app = createTestApp();

// ─── POST /api/auth/register ─────────────────────────────────
describe("POST /api/auth/register", () => {
  const validUser = {
    email: "test@example.com",
    username: "testuser",
    password: "securePass123",
  };

  test("creates a new user and returns JWT", async () => {
    // No existing user found
    prisma.user.findFirst.mockResolvedValue(null);
    // User creation succeeds
    prisma.user.create.mockResolvedValue({
      id: "new-uuid",
      email: validUser.email,
      username: validUser.username,
      xp: 0,
      level: 1,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    // Password should never be in the response
    expect(res.body.user.password).toBeUndefined();
  });

  test("rejects duplicate email", async () => {
    prisma.user.findFirst.mockResolvedValue({ email: validUser.email });

    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  test("rejects duplicate username", async () => {
    prisma.user.findFirst.mockResolvedValue({ username: validUser.username });

    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username/i);
  });

  test("validates email format", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "not-an-email" });

    expect(res.status).toBe(400);
  });

  test("requires minimum password length of 8", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "short" });

    expect(res.status).toBe(400);
  });

  test("validates username format (alphanumeric, hyphens, underscores)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, username: "bad user name!" });

    expect(res.status).toBe(400);
  });

  test("enforces username min length of 3", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, username: "ab" });

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/login ────────────────────────────────────
describe("POST /api/auth/login", () => {
  const hashedPassword = bcrypt.hashSync("securePass123", 12);

  test("returns JWT for valid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      username: "testuser",
      password: hashedPassword,
      xp: 100,
      level: 1,
      currentStreak: 3,
      longestStreak: 7,
      skillTier: 1,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "securePass123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe("testuser");
    // Password must never appear in response
    expect(res.body.user.password).toBeUndefined();
  });

  test("returns 401 for unknown email", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "anything" });

    expect(res.status).toBe(401);
    // Error message should not reveal whether email exists
    expect(res.body.error).toBe("Invalid credentials");
  });

  test("returns 401 for wrong password", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: hashedPassword,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    // Same generic error to prevent user enumeration
    expect(res.body.error).toBe("Invalid credentials");
  });
});

// ─── GET /api/auth/me ────────────────────────────────────────
describe("GET /api/auth/me", () => {
  test("returns user profile with valid token", async () => {
    const token = generateTestToken("user-1");
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      username: "testuser",
      xp: 500,
      level: 2,
      currentStreak: 5,
      longestStreak: 10,
      skillTier: 2,
      preferredBpm: 90,
      lastPractice: null,
      createdAt: new Date(),
      _count: { sessions: 12, achievements: 3 },
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("testuser");
    expect(res.body.user.xp).toBe(500);
  });

  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-garbage-token");
    expect(res.status).toBe(401);
  });

  test("returns 401 with malformed Authorization header", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "NotBearer some-token");
    expect(res.status).toBe(401);
  });
});
