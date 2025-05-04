const { body } = require('express-validator');

const validateLoginInputs = [
    body('email')
        .notEmpty().withMessage('Email không được để trống!')
        .normalizeEmail(),     
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống!'),
];

module.exports = validateLoginInputs;