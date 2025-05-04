const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authController = require('../app/controllers/AuthController');
const validateRegisterInputs = require('../middlewares/validateAuth/validateRegisterInputs');
const validateLoginInputs = require('../middlewares/validateAuth/validateLoginInputs');

// Mock UserModel
jest.mock('../app/models/UserModel', () => ({
    findUserByEmail: jest.fn(),
    create: jest.fn(),
}));

const UserModel = require('../app/models/UserModel');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());
app.post('/register', validateRegisterInputs, authController.register);
app.post('/login', validateLoginInputs, authController.login);

// Gán giá trị tạm cho biến môi trường
process.env.JWT_SECRET = 'testsecret';

describe('POST /register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Đăng ký thành công', async () => {
        UserModel.findUserByEmail.mockResolvedValue(null);
        UserModel.create.mockResolvedValue();

        const res = await request(app).post('/register').send({
            fullName: "Nguyễn Văn A",
            email: "a@gmail.com",
            password: "123456",
            confirmPassword: "123456",
            gender: "nam",
            phone: "0912345678"
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Đăng ký thành công!");
    });

    test('❌ Email đã tồn tại', async () => {
        UserModel.findUserByEmail.mockResolvedValue({ id: 1 });

        const res = await request(app).post('/register').send({
            fullName: "Nguyễn Văn A",
            email: "a@gmail.com",
            password: "123456",
            confirmPassword: "123456",
            gender: "nam",
            phone: "0912345678"
        });

        expect(res.statusCode).toBe(409);
        expect(res.body.errors[0].msg).toBe("Email đã tồn tại!");
    });

    test('❌ Lỗi validate - thiếu mật khẩu', async () => {
        const res = await request(app).post('/register').send({
            fullName: "Nguyễn Văn A",
            email: "a@gmail.com",
            gender: "nam",
            phone: "0912345678"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors.some(e => e.msg.includes("Mật khẩu"))).toBe(true);
    });
});

describe('POST /login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('✅ Đăng nhập thành công', async () => {
        const mockUser = {
            id_user: 1,
            full_name: "Nguyễn Văn A",
            email: "a@gmail.com",
            password: await bcrypt.hash("123456", 10),
            role: "user",
            is_delete: 0
        };
        UserModel.findUserByEmail.mockResolvedValue(mockUser);

        const res = await request(app).post('/login').send({
            email: "a@gmail.com",
            password: "123456"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Đăng nhập thành công!");
        expect(res.body.token).toBeDefined();
        expect(res.body.redirect).toBe("users/user.html");
    });

    test('❌ Sai mật khẩu', async () => {
        const mockUser = {
            id_user: 1,
            email: "a@gmail.com",
            password: await bcrypt.hash("123456", 10),
            role: "user",
            is_delete: 0
        };
        UserModel.findUserByEmail.mockResolvedValue(mockUser);

        const res = await request(app).post('/login').send({
            email: "a@gmail.com",
            password: "saimatkhau"
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.errors[0].msg).toBe("Sai mật khẩu!");
    });

    test('❌ Tài khoản không tồn tại', async () => {
        UserModel.findUserByEmail.mockResolvedValue(null);

        const res = await request(app).post('/login').send({
            email: "khongco@gmail.com",
            password: "123456"
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.errors[0].msg).toBe("Tài khoản không tồn tại!");
    });

    test('❌ Tài khoản đã bị khóa', async () => {
        const mockUser = {
            id_user: 1,
            email: "a@gmail.com",
            password: await bcrypt.hash("123456", 10),
            role: "user",
            is_delete: 1
        };
        UserModel.findUserByEmail.mockResolvedValue(mockUser);

        const res = await request(app).post('/login').send({
            email: "a@gmail.com",
            password: "123456"
        });

        expect(res.statusCode).toBe(403);
        expect(res.body.errors[0].msg).toBe("Tài khoản đã bị khóa!");
    });
});
