import { Router, type CookieOptions } from "express";
import prisma from "./prisma";
import { compare, hashSync } from "bcrypt";
import * as jwt from "jsonwebtoken";

const router = Router();

router.post('/signup', async (req, res) => {
	const { name, email, password } = req.body as { name: string; password: string; email: string };

	const user = await prisma.user.findFirst({
		where: {
			email
		}
	});

	if (user) {
		return res.status(401).json({ message: 'User already exists' });
	}

	const hashedPassword = hashSync(password, 12)

	const newUser = await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
		}
	})

	const token = jwt.sign({ id: newUser.id }, String(process.env.JWT_SECRET!), { expiresIn: '30d' });

	const cookieOptions: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 60 * 60 * 1000 * 24 * 30,
		path: '/',
		partitioned: true
	}

	res.cookie('session_token', token, cookieOptions);

	return res.status(200).json({
		message: "User created and logged in successfully"
	});
});

router.post('/signin', async (req, res) => {
	const { email, password } = req.body;

	const user = await prisma.user.findFirst({
		where: {
			email
		}
	});

	if (!user) {
		return res.status(401).json({ message: 'Invalid email or password' });
	}

	const isValidPassword = await compare(password, user.password);

	if (!isValidPassword) {
		return res.status(401).json({ message: 'Invalid email or password' });
	}

	const token = jwt.sign({ id: user.id }, String(process.env.JWT_SECRET!), { expiresIn: '30d' });

	const cookieOptions: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 60 * 60 * 1000 * 24 * 30,
		path: '/',
		partitioned: true
	}

	res.cookie('session_token', token, cookieOptions);

	res.status(200).json({ user });
});

router.get('/profile', async (req, res) => {
	const token = req.cookies['session_token']

	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	try {
		const decoded = jwt.verify(token, String(process.env.JWT_SECRET!));

		const user = await prisma.user.findFirst({
			where: {
				id: (decoded as any).id
			}
		});

		if (!user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		res.json(user);
	} catch (error) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
});

router.post('/logout', (req, res) => {
	res.clearCookie('session_token')
	res.json({ message: 'Logged out successfully' });
});

router.get("/", (_req, res) => {
	return res.send({ message: "Olá! Seja bem-vindo ao servidor do projeto SkillsCheck Dev" }).status(200)
})

export default router;