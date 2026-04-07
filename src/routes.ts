import { Router } from "express";
import prisma from "./prisma";
import { compare, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.post('/sign_up', async (req, res) => {
	const { email, username, password } = req.body;

	const user = await prisma.user.findFirst({
		where: {
			email
		}
	});

	if (user) {
		return res.status(401).json({ message: 'User already exists' });
	}

	const newUser = await prisma.user.create({
		data: {
			email,
			name: username,
			password: hashSync(password, 12)
		}
	})

	const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });

	const isProd = process.env.NODE_ENV === 'production'

	res.cookie('session_token', token, {
		httpOnly: true,
		secure: isProd,
		sameSite: 'none',
		maxAge: 60 * 60 * 1000 * 24 * 30,
		path: '/',
		domain: isProd ? 'skillscheck-dev-server.vercel.app' : 'localhost',
		partitioned: true
	})

	res.json({ user });
});

router.post('/login', async (req, res) => {
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

	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });

	const isProd = process.env.NODE_ENV === 'production'

	res.cookie('session_token', token, {
		httpOnly: true,
		secure: isProd,
		sameSite: 'none',
		maxAge: 60 * 60 * 1000 * 24 * 30,
		path: '/',
		domain: isProd ? 'skillscheck-dev-server.vercel.app' : 'localhost',
		partitioned: true
	})

	res.json({ user });
});

router.get('/profile', async (req, res) => {
	const token = req.cookies['session_token']

	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	try {
		const decoded = jwt.verify(token, 'UmaSenhaSuperSecreta');

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

export default router;