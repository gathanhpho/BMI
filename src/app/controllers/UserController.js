const BmiModel = require("../models/BmiModel");
const UserModel = require("../models/UserModel");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

class UserController {
    async bmiUser(req, res) {
        try {
            const idUser = req.user.idUser;

            const { height, weight } = req.body;

            if (!height || !weight) {
                return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
            }

            // Tính BMI
            const heightInMeters = height / 100;
            const weightInKg = weight;

            const bmiIndex = (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);

            // Xác định tình trạng BMI
            let status;
            if (bmiIndex < 18.5) {
                status = "Thiếu cân";
            } else if (bmiIndex >= 18.5 && bmiIndex < 24.9) {
                status = "Bình thường";
            } else if (bmiIndex >= 25 && bmiIndex < 29.9) {
                status = "Thừa cân";
            } else {
                status = "Béo phì";
            }

            let advice = "";
            if (bmiIndex < 18.5) {
                advice = "Bạn đang thiếu cân. Hãy ăn uống đủ chất và tập luyện để tăng cân.";
            } else if (bmiIndex >= 18.5 && bmiIndex < 24.9) {
                advice = "Chúc mừng! Bạn có cân nặng lý tưởng. Hãy duy trì lối sống lành mạnh.";
            } else if (bmiIndex >= 25 && bmiIndex < 29.9) {
                advice = "Bạn đang thừa cân. Hãy điều chỉnh chế độ ăn và tập luyện để giảm cân.";
            } else {
                advice = "Bạn đang béo phì. Hãy tham khảo ý kiến bác sĩ để có kế hoạch giảm cân an toàn.";
            }

            const idBMI = uuidv4();
            // Lưu vào database
            await BmiModel.saveBMI(idBMI, idUser, height, weight, bmiIndex, status);

            res.json({ message: "Tính toán và lưu thành công", bmiIndex, advice });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    async getUserInfo(req, res) {
        try {
            const idUser = req.user.idUser;
            // console.log(req.user);

            const user = await UserModel.getUserById(idUser);
            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const idUser = req.user.idUser;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (!currentPassword || !newPassword, !confirmPassword) {
                return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
            }

            // Lấy password cũ từ db
            const user = await UserModel.getUserById(idUser);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }

            // Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu cũ không đúng!" });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: "Mật khẩu mới không khớp!" });
            }

            // Băm mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(newPassword, salt);
            await UserModel.updatePassword(idUser, newHashedPassword);
            res.json({ message: "Đổi mật khẩu thành công" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    async getBMIHistoryByUser(req, res) {
        try {
            const idUser = req.user.idUser;
            const bmiHistoryByUser = await BmiModel.getBMIByUserId(idUser);

            if (bmiHistoryByUser.length === 0) {
                return res.status(404).json({ message: "Không có lịch sử BMI nào." });
            }

            res.json(bmiHistoryByUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    async filterBMI(req, res) {
        try {
            const idUser = req.user.idUser;
            const { status } = req.query;

            const bmiRecords = await BmiModel.filterBMI(idUser, status);
            res.json(bmiRecords);
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
        }
    }

    async softDeleteUser(req, res) {
        try {
            const idBMI = req.params.idBMI;
            await BmiModel.softDeleteBMI(idBMI);
            res.json({ message: 'Tài khoản đã được đánh dấu xoá' , is_delete: true });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    async updateUserInfo(req, res) {
        try {
            const idUser = req.user.idUser;
            const { fullName, gmail } = req.body;

            await UserModel.updateUserInfo(idUser, fullName, gmail);

            res.status(200).json({ message: "Cập nhật thông tin thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi cập nhật thông tin", error: error.message });
        }
    }
}

module.exports = new UserController();