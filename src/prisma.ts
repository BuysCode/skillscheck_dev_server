import { PrismaClient } from "./generated/prisma/client"
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const fallbackUrl = process.env.NODE_ENV === 'production' ? 'file:/tmp/dev.db' : 'file:./dev.db';
const databaseUrl = process.env.DATABASE_URL?.trim() || fallbackUrl;

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    adapter
  })

  return prisma;
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma

export default prisma