const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

class AuthControllers {
    async register(req, res) {
        try {
            const { fullName, gmail, password, confirmPassword } = req.body;

            if (!fullName || !gmail || !password || !confirmPassword) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
            }

            // Kiểm tra email phải có đúng đuôi @gmail.com
            const emailRegex = /^[^\s@]+@gmail\.com$/;
            if (!emailRegex.test(gmail)) {
                return res.status(400).json({ message: "Gmail phải có định dạng @gmail.com!" });
            }
            // Kiểm tra độ dài mật khẩu phải trên 6 ký tự
            if (password.length < 6) {
                return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ message: "Mật khẩu xác nhận không khớp!" });
            }

            const existingUser = await User.findByEmail(gmail);
            if (existingUser) {
                return res.status(409).json({ message: "Email đã tồn tại!" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const idUser = uuidv4();

            await User.create(idUser, fullName, gmail, hashedPassword);
            res.status(201).json({ message: "Đăng ký thành công!" });

        } catch (error) {
            res.status(500).json({ message: "Đăng ký thất bại!", error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { gmail, password } = req.body;

            if (!gmail || !password) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
            }

            const checkEmail = await User.findByEmail(gmail);
            if (!checkEmail) {
                return res.status(401).json({ message: "Sai Gmail không tồn tại!" });
            }

            const isMatch = await bcrypt.compare(password, checkEmail.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Sai mật khẩu!" });
            }

            // Tạo token JWT
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: "Lỗi máy chủ: Thiếu JWT_SECRET!" });
            }

            const token = jwt.sign(
                { idUser: checkEmail.id_user, role: checkEmail.role },
                process.env.JWT_SECRET,
                { expiresIn: "2d" }
            );

            res.json({
                message: "Đăng nhập thành công!",
                token,
                fullName: checkEmail.full_name,
                redirect: checkEmail.role === "admin" ? "admin/admin.html" : "users/user.html"
            });
        } catch (error) {
            res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
        }
    }
}

module.exports = new AuthControllers();
