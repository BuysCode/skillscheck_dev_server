import { hashSync } from "bcrypt"
import prisma from '../src/prisma'

const userAdmin = {
  email: process.env.ADMIN_EMAIL!,
  name: process.env.ADMIN_NAME!,
  password: hashSync(process.env.ADMIN_PASSWORD!, 10),
}

export async function main() {
  await prisma.user.create({
    data: userAdmin
  })
}

main()