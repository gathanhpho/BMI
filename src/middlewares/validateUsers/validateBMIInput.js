const { body } = require('express-validator');

const validateBMIInput = [
    body('height')
        .notEmpty().withMessage('Chiều cao không được để trống')
        .isFloat({ min: 50, max: 250 }).withMessage('Chiều cao phải giữa 50cm và 250cm!'),

    body('weight')
        .notEmpty().withMessage('Cân nặng không được để trống')
        .isFloat({ min: 10, max: 300 }).withMessage('Cân nặng phải từ 10kg đến 300kg!')
];

module.exports = validateBMIInput;