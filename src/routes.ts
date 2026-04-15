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

	res.json({ user, token });
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

	res.json({ user, token });
});

router.get('/profile', async (req, res) => {
	const authHeader = req.headers['authorization'];
	const splittedAuthorization = authHeader?.split(' ') as string[]
	const token = splittedAuthorization[1];

	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

		const user = await prisma.user.findFirst({
			where: { id: decoded.id },
			omit: { password: true }
		});

		if (!user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		res.json(user);
	} catch (error) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
});

export default router;