"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./generated/prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const fallbackUrl = process.env.NODE_ENV === 'production' ? 'file:/tmp/dev.db' : 'file:./dev.db';
const databaseUrl = process.env.DATABASE_URL?.trim() || fallbackUrl;
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: databaseUrl });
const prismaClientSingleton = () => {
    const prisma = new client_1.PrismaClient({
        adapter
    });
    return prisma;
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production")
    globalThis.prismaGlobal = prisma;
exports.default = prisma;
