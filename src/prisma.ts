import { PrismaClient } from "./generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL!

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

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