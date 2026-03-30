"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./generated/prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prismaClientSingleton = () => {
    const prisma = new client_1.PrismaClient({
        adapter
    });
    return prisma;
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
exports.default = prisma;
if (process.env.NODE_ENV !== "production")
    globalThis.prismaGlobal === prisma;
