const { body } = require('express-validator');

const validateRegisterInputs = [
    body('fullName')
        .notEmpty().withMessage('Họ và tên không được để trống!'),
    body('email')
        .isEmail().withMessage('Định dạng email không hợp lệ!')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự!'),
    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password).withMessage('Mật khẩu xác nhận không khớp!'),
    body('gender')
        .isIn(['nam', 'nữ', 'khác']).withMessage("Giới tính phải là 'nam', 'nữ' hoặc 'khác'!"),
    body('phone')
        .matches(/^(\+84|0)\d{9}$|^0\d{2}([-. ])?\d{3}([-. ])?\d{4}$|^\+?[1-9]\d{1,14}$/).withMessage('Số điện thoại không hợp lệ!')
];

module.exports = validateRegisterInputs;