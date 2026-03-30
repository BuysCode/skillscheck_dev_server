"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const bcrypt_1 = require("bcrypt");
const prisma_1 = __importDefault(require("../src/prisma"));
const userAdmin = {
    email: "super@admin.com",
    name: "Super Admin",
    password: (0, bcrypt_1.hashSync)("teste123", 10),
};
async function main() {
    await prisma_1.default.user.create({
        data: userAdmin
    });
}
main();
