const { body } = require('express-validator');

const validateInfo = [
    body('fullName')
        .notEmpty().withMessage('Họ và tên không được để trống!'),

    body('email')
        .notEmpty().withMessage('Email không được để trống!')
        .isEmail().withMessage('Email không hợp lệ!')
        .normalizeEmail(),

    body('gender')
        .notEmpty().withMessage('Giới tính không được để trống!')
        .isIn(['Nam', 'Nữ', 'Khác']).withMessage('Giới tính không hợp lệ!'),

    body('phone')
        .notEmpty().withMessage('Số điện thoại không được để trống!')
        .isLength({ min: 10, max: 15 }).withMessage('Số điện thoại phải có từ 10 đến 15 ký tự!')
];

module.exports = validateInfo;