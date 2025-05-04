const { validationResult } = require('express-validator');

const bmiGues = (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { weight, height } = req.body;

    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    let advice = "";

    if (bmi < 18.5) {
        advice = "Bạn đang thiếu cân. Hãy ăn uống đủ chất và tập luyện để tăng cân.";
    } else if (bmi >= 18.5 && bmi < 24.9) {
        advice = "Chúc mừng! Bạn có cân nặng lý tưởng. Hãy duy trì lối sống lành mạnh.";
    } else if (bmi >= 25 && bmi < 29.9) {
        advice = "Bạn đang thừa cân. Hãy điều chỉnh chế độ ăn và tập luyện để giảm cân.";
    } else {
        advice = "Bạn đang béo phì. Hãy tham khảo ý kiến bác sĩ để có kế hoạch giảm cân an toàn.";
    }

    res.json({ bmi, advice });
};

module.exports = bmiGues;
