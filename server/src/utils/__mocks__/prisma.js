// ═══════════════════════════════════════════════════════════════
//  FretForge — Prisma Mock for Testing
//  Jest automatically uses this when any module imports ../utils/prisma
//  because it's in the __mocks__ directory adjacent to utils/
//
//  Each test can configure return values like:
//    prisma.user.findUnique.mockResolvedValue({ id: "1", ... });
//
//  The jest.config.js clearMocks: true resets all mocks between tests.
// ═══════════════════════════════════════════════════════════════

const prisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  practiceSession: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  chordProgress: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  scaleProgress: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userAchievement: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  // Health check uses raw query
  $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
  $disconnect: jest.fn(),
};

module.exports = prisma;
