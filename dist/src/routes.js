"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("./prisma"));
const bcrypt_1 = require("bcrypt");
const jwt = __importStar(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const user = await prisma_1.default.user.findFirst({
        where: {
            email
        }
    });
    if (user) {
        return res.status(401).json({ message: 'User already exists' });
    }
    const hashedPassword = (0, bcrypt_1.hashSync)(password, 12);
    const newUser = await prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    });
    const token = jwt.sign({ id: newUser.id }, String(process.env.JWT_SECRET), { expiresIn: '1h' });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('session_token', token, {
        httpOnly: true,
        secure: isProd, // true em produção com HTTPS
        sameSite: isProd ? 'none' : 'lax', // 'none' em produção com HTTPS
        maxAge: 60 * 60 * 1000, // 1 hora
        path: '/',
        domain: isProd ? '.seu-dominio.com' : 'localhost' // ajuste conforme necessário
    });
    return res.json({
        message: "User created and logged in successfully"
    }).status(200);
});
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findFirst({
        where: {
            email
        }
    });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isValidPassword = await (0, bcrypt_1.compare)(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id }, String(process.env.JWT_SECRET), { expiresIn: '1h' });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('session_token', token, {
        httpOnly: true,
        secure: isProd, // true em produção com HTTPS
        sameSite: isProd ? 'none' : 'lax', // 'none' em produção com HTTPS
        maxAge: 60 * 60 * 1000, // 1 hora
        path: '/',
        domain: isProd ? '.seu-dominio.com' : 'localhost' // ajuste conforme necessário
    });
    res.json({ user });
});
router.get('/profile', async (req, res) => {
    const token = req.cookies['session_token'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, String(process.env.JWT_SECRET));
        const user = await prisma_1.default.user.findFirst({
            where: {
                id: decoded.id
            }
        });
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.json(user);
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
});
router.post('/logout', (req, res) => {
    res.clearCookie('session_token');
    res.json({ message: 'Logged out successfully' });
});
router.get("/", (_req, res) => {
    return res.send({ message: "Olá! Seja bem-vindo ao servidor do projeto SkillsCheck Dev" }).status(200);
});
exports.default = router;
