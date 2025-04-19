const request = require("supertest");
const express = require("express");
const authController = require("../app/controllers/AuthController");
const User = require("../app/models/UserModel");
const bcrypt = require("bcryptjs");

jest.mock("../app/models/UserModel");
jest.mock("bcryptjs");

const app = express();
app.use(express.json());

app.post("/auth/register", (req, res) => authController.register(req, res));
app.post("/auth/login", (req, res) => authController.login(req, res));

describe("POST /auth/register", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Trả lỗi khi thiếu thông tin đầu vào", async () => {
        const res = await request(app).post("/auth/register").send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Vui lòng nhập đầy đủ thông tin!");
    });

    it("Trả lỗi khi email không đúng định dạng", async () => {
        const res = await request(app).post("/auth/register").send({
            fullName: "Test",
            gmail: "test@example.com",
            password: "123456",
            confirmPassword: "123456"
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Gmail phải có định dạng @gmail.com!");
    });

    it("Trả lỗi khi mật khẩu quá ngắn", async () => {
        const res = await request(app).post("/auth/register").send({
            fullName: "Test",
            gmail: "test@gmail.com",
            password: "123",
            confirmPassword: "123"
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Mật khẩu phải có ít nhất 6 ký tự!");
    });

    it("Trả lỗi khi xác nhận mật khẩu không khớp", async () => {
        const res = await request(app).post("/auth/register").send({
            fullName: "Test",
            gmail: "test@gmail.com",
            password: "123456",
            confirmPassword: "654321"
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Mật khẩu xác nhận không khớp!");
    });

    it("Trả lỗi khi email đã tồn tại", async () => {
        User.findByEmail.mockResolvedValue({ id_user: "abc123" });

        const res = await request(app).post("/auth/register").send({
            fullName: "Test",
            gmail: "test@gmail.com",
            password: "123456",
            confirmPassword: "123456"
        });

        expect(res.status).toBe(409);
        expect(res.body.message).toBe("Email đã tồn tại!");
    });

    it("Đăng ký thành công", async () => {
        User.findByEmail.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashedPassword");
        User.create.mockResolvedValue();

        const res = await request(app).post("/auth/register").send({
            fullName: "Test",
            gmail: "test@gmail.com",
            password: "123456",
            confirmPassword: "123456"
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Đăng ký thành công!");
    });
});

describe("POST /auth/login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    it("Trả lỗi khi thiếu thông tin", async () => {
        const res = await request(app).post("/auth/login").send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Vui lòng nhập đầy đủ thông tin!");
    });

    it("Trả lỗi khi email không tồn tại", async () => {
        User.findByEmail.mockResolvedValue(null);

        const res = await request(app).post("/auth/login").send({
            gmail: "test@gmail.com",
            password: "123456"
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Sai Gmail không tồn tại!");
    });

    it("Trả lỗi khi sai mật khẩu", async () => {
        User.findByEmail.mockResolvedValue({ password: "hashed" });
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app).post("/auth/login").send({
            gmail: "test@gmail.com",
            password: "123456"
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Sai mật khẩu!");
    });

    it("Đăng nhập thành công và trả về token", async () => {
        const user = {
            id_user: "user123",
            full_name: "Test",
            gmail: "test@gmail.com",
            password: "hashed",
            role: "user"
        };

        User.findByEmail.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app).post("/auth/login").send({
            gmail: "test@gmail.com",
            password: "123456"
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Đăng nhập thành công!");
        expect(res.body).toHaveProperty("token");
        expect(res.body.redirect).toBe("users/user.html");
    });
});

