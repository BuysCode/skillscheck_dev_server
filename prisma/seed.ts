import { hashSync } from "bcrypt"
import prisma from '../src/prisma'

const userAdmin = {
  email: "super@admin.com",
  name: "Super Admin",
  password: hashSync("teste123", 10),
}

export async function main() {
	await prisma.user.create({
		data: userAdmin
	})
}

main()