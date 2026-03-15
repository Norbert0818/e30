// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Létrehozzuk a kapcsolatot a .env fájlban lévő URL alapján
const connectionString = process.env.DATABASE_URL as string;

// 2. Létrehozzuk az adaptert a kapcsolat konfigurációjából
const adapter = new PrismaPg({ connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 3. Odaadom a Prismának az adaptert!
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // <-- EZ OLDJA MEG A HIBÁT
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;