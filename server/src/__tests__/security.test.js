// ═══════════════════════════════════════════════════════════════
//  FretForge — Security Tests
//  Validates JWT edge cases, middleware behavior, input
//  sanitization, oversized payloads, and response hygiene.
//  These tests exist to catch regressions on security fixes.
// ═══════════════════════════════════════════════════════════════

jest.mock("../../utils/prisma");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const prisma = require("../../utils/prisma");
const { createTestApp, generateTestToken } = require("./helpers/app");

const app = createTestApp();

// ─── JWT Edge Cases ──────────────────────────────────────────
describe("JWT Security", () => {
  test("rejects expired tokens", async () => {
    // Token that expired 1 hour ago
    const expiredToken = jwt.sign(
      { userId: "user-1" },
      process.env.JWT_SECRET,
      { expiresIn: "-1h" }
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  test("rejects tokens signed with wrong secret", async () => {
    const badToken = jwt.sign(
      { userId: "user-1" },
      "wrong-secret-entirely"
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${badToken}`);

    expect(res.status).toBe(401);
  });

  test("rejects tokens with missing userId claim", async () => {
    // Token has no userId field — signed correctly but malformed payload
    const malformedToken = jwt.sign(
      { role: "admin" }, // no userId
      process.env.JWT_SECRET
    );

    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${malformedToken}`);

    // Should either 401 or 404 — never 200
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("rejects empty bearer token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer ");

    expect(res.status).toBe(401);
  });

  test("rejects Authorization header without Bearer prefix", async () => {
    const token = generateTestToken("user-1");
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", token); // Missing "Bearer " prefix

    expect(res.status).toBe(401);
  });
});

// ─── Input Sanitization ──────────────────────────────────────
describe("Input Validation", () => {
  test("register: rejects empty body", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({});

    expect(res.status).toBe(400);
  });

  test("register: rejects extremely long username", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        username: "a".repeat(500),
        password: "securePass123",
      });

    expect(res.status).toBe(400);
  });

  test("register: rejects XSS in username", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        username: "<script>alert('xss')</script>",
        password: "securePass123",
      });

    // Zod regex should reject non-alphanumeric characters
    expect(res.status).toBe(400);
  });

  test("login: rejects missing email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "securePass123" });

    expect(res.status).toBe(400);
  });

  test("login: rejects missing password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
  });
});

// ─── Response Hygiene ────────────────────────────────────────
describe("Response Security", () => {
  test("login response never contains password hash", async () => {
    const bcrypt = require("bcryptjs");
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      username: "testuser",
      password: bcrypt.hashSync("securePass123", 12),
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      skillTier: 1,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "securePass123" });

    expect(res.status).toBe(200);
    // Ensure password hash is scrubbed from response
    const body = JSON.stringify(res.body);
    expect(body).not.toContain("$2a$"); // bcrypt prefix
    expect(body).not.toContain("$2b$"); // bcrypt prefix variant
    expect(res.body.user.password).toBeUndefined();
  });

  test("registration response never contains password hash", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: "new-user",
      email: "new@example.com",
      username: "newuser",
      xp: 0,
      level: 1,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "new@example.com",
        username: "newuser",
        password: "securePass123",
      });

    expect(res.status).toBe(201);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain("$2a$");
    expect(body).not.toContain("$2b$");
  });

  test("health endpoint is accessible without auth", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });
});

// ─── Oversized Payload Protection ────────────────────────────
describe("Payload Limits", () => {
  test("rejects payloads larger than 100kb", async () => {
    const hugePayload = { data: "x".repeat(200 * 1024) }; // ~200KB

    const res = await request(app)
      .post("/api/auth/register")
      .send(hugePayload);

    // Express should reject with 413 Payload Too Large
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
