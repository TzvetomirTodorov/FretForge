// ═══════════════════════════════════════════════════════════════
//  FretForge — Session Route Tests
//  Tests: POST /sessions, PATCH /sessions/:id/end
//  Validates IDOR protection, ownership checks, double-submit guard
// ═══════════════════════════════════════════════════════════════

jest.mock("../../utils/prisma");

const request = require("supertest");
const prisma = require("../../utils/prisma");
const { createTestApp, generateTestToken } = require("./helpers/app");

const app = createTestApp();
const token = generateTestToken("user-1");

// ─── POST /api/sessions — Create a practice session ──────────
describe("POST /api/sessions", () => {
  test("creates a new session for authenticated user", async () => {
    prisma.practiceSession.create.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      type: "chord_practice",
      startedAt: new Date(),
      bpm: 80,
    });

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "chord_practice", bpm: 80 });

    expect(res.status).toBe(201);
    expect(res.body.session.type).toBe("chord_practice");
  });

  test("requires authentication", async () => {
    const res = await request(app)
      .post("/api/sessions")
      .send({ type: "chord_practice" });

    expect(res.status).toBe(401);
  });

  test("rejects invalid session type", async () => {
    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "invalid_type" });

    expect(res.status).toBe(400);
  });
});

// ─── PATCH /api/sessions/:id/end — End a session ────────────
describe("PATCH /api/sessions/:id/end", () => {
  test("ends a session owned by the authenticated user", async () => {
    prisma.practiceSession.findUnique.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      startedAt: new Date(Date.now() - 300000), // 5 min ago
      endedAt: null,
    });
    prisma.practiceSession.update.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      endedAt: new Date(),
      xpEarned: 10,
    });
    prisma.user.update.mockResolvedValue({ id: "user-1", xp: 110 });

    const res = await request(app)
      .patch("/api/sessions/session-1/end")
      .set("Authorization", `Bearer ${token}`)
      .send({ totalChords: 10, correctChords: 7, xpEarned: 10 });

    expect(res.status).toBe(200);
    expect(res.body.session.endedAt).toBeDefined();
  });

  test("IDOR: rejects ending another user's session", async () => {
    // Session belongs to user-2, but our token is for user-1
    prisma.practiceSession.findUnique.mockResolvedValue({
      id: "session-99",
      userId: "user-2",
      endedAt: null,
    });

    const res = await request(app)
      .patch("/api/sessions/session-99/end")
      .set("Authorization", `Bearer ${token}`)
      .send({ totalChords: 5, correctChords: 5, xpEarned: 50 });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/own/i);
  });

  test("returns 404 for non-existent session", async () => {
    prisma.practiceSession.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/sessions/nonexistent/end")
      .set("Authorization", `Bearer ${token}`)
      .send({ totalChords: 0, correctChords: 0, xpEarned: 0 });

    expect(res.status).toBe(404);
  });

  test("double-submit guard: rejects ending an already-ended session", async () => {
    prisma.practiceSession.findUnique.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      endedAt: new Date(), // Already ended
    });

    const res = await request(app)
      .patch("/api/sessions/session-1/end")
      .set("Authorization", `Bearer ${token}`)
      .send({ totalChords: 5, correctChords: 3, xpEarned: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already/i);
  });

  test("requires authentication", async () => {
    const res = await request(app)
      .patch("/api/sessions/session-1/end")
      .send({ totalChords: 0, correctChords: 0, xpEarned: 0 });

    expect(res.status).toBe(401);
  });
});
