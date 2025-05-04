const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');

class AuthControllers {

    async register(req, res) {
        try {
            // Kiểm tra lỗi từ express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { fullName, email, password, gender, phone } = req.body;

            // Kiểm tra email đã tồn tại trong hệ thống
            const existingUser = await UserModel.findUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    errors: [
                        { path: "email", msg: "Email đã tồn tại!" }
                    ]
                });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(14);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Lưu vào cơ sở dữ liệu
            await UserModel.create(fullName, email, hashedPassword, gender, phone);

            // Trả về thông báo đăng ký thành công
            res.status(201).json({ message: 'Đăng ký thành công!' });
        } catch (error) {
            res.status(500).json({ message: 'Đăng ký thất bại!', error: error.message });
        }
    }

    // đăng nhập
    async login(req, res) {
        try {
            // Kiểm tra lỗi từ express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Kiểm tra email có tồn tại trong hệ thống không
            const auth = await UserModel.findUserByEmail(email);
            if (!auth) {
                return res.status(401).json({
                    errors: [
                        { path: "email", msg: "Tài khoản không tồn tại!" }
                    ]
                });
            }

            // Kiểm tra tài khoản có bị khóa hay ko
            if (Number(auth.is_delete) === 1) {
                return res.status(403).json({
                    errors: [
                        { path: "email", msg: "Tài khoản đã bị khóa!" }
                    ]
                });
            }

            // Kiểm tra mật khẩu có khớp không
            const isMatch = await bcrypt.compare(password, auth.password);
            if (!isMatch) {
                return res.status(401).json({errors: [
                    { path: "password", msg: "Sai mật khẩu!" }
                ]});
            }

            // Kiểm tra môi trường có biến JWT_SECRET không
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: "Lỗi máy chủ: Thiếu JWT_SECRET!" });
            }

            // Tạo token JWT (Access Token)
            const token = jwt.sign(
                { idUser: auth.id_user, role: auth.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            // Trả về thông tin đăng nhập thành công và token
            res.json({
                message: "Đăng nhập thành công!",
                token,
                fullName: auth.full_name,
                redirect: auth.role === 'admin' ? 'admin/admin.html' : 'users/user.html'
            });

        } catch (error) {
            // Xử lý lỗi máy chủ
            res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
        }
    }
}
module.exports = new AuthControllers();
