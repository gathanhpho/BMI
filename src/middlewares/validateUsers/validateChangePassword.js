const { body } = require('express-validator');

// Middleware để kiểm tra dữ liệu nhập vào
const validateChangePassword = [

    // Kiểm tra mật khẩu mới
    body('newPassword')
        .notEmpty().withMessage('Mật khẩu mới không được để trống!')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự!')
        .custom((value, { req }) => value !== req.body.oldPassword).withMessage('Mật khẩu mới không được trùng với mật khẩu cũ!'),

    // Kiểm tra xác nhận mật khẩu mới
    body('confirmPassword')
        .custom((value, { req }) => value === req.body.newPassword).withMessage('Mật khẩu xác nhận không khớp!'),
];

module.exports = validateChangePassword;