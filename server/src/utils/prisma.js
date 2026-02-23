// ═══════════════════════════════════════════════════════════════
//  FretForge — Prisma Singleton
//  ALWAYS import from here, never create new PrismaClient() elsewhere
//  Lesson learned: multiple PrismaClient instances exhaust the
//  connection pool and crash Railway deployments (see portfolio audit #1)
// ═══════════════════════════════════════════════════════════════

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

module.exports = prisma;
