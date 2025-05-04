const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 phút
    max: 5,  // Cho phép tối đa 5 yêu cầu đăng nhập trong 5 phút
    statusCode: 429, // Cấu hình trả về mã lỗi 429
    handler: (req, res, next) => {
        res.status(429).json({
            message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 5 phút!",
        });
    },
});

module.exports = loginLimiter;