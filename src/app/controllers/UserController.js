const BmiModel = require("../models/BmiModel");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');

class UserController {
    async BMIUser(req, res) {
        try {
            // Kiểm tra lỗi từ express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const idUser = req.user.idUser;
            const { height, weight } = req.body;

            // Tính BMI
            const heightInMeters = height / 100;
            const bmiIndex = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));

            // Xác định tình trạng BMI (sử dụng đúng với ENUM trong DB)
            let status;
            let advice;

            if (bmiIndex < 18.5) {
                status = "Thiếu cân";
                advice = "Bạn đang thiếu cân. Hãy ăn uống đủ chất và tập luyện để tăng cân.";
            } else if (bmiIndex >= 18.5 && bmiIndex < 24.9) {
                status = "Bình thường";
                advice = "Chúc mừng! Bạn có cân nặng lý tưởng. Hãy duy trì lối sống lành mạnh.";
            } else if (bmiIndex >= 25 && bmiIndex < 29.9) {
                status = "Thừa cân";
                advice = "Bạn đang thừa cân. Hãy điều chỉnh chế độ ăn và tập luyện để giảm cân.";
            } else {
                status = "Béo phì";
                advice = "Bạn đang béo phì. Hãy tham khảo ý kiến bác sĩ để có kế hoạch giảm cân an toàn.";
            }

            // Lưu vào database
            await BmiModel.saveBMI(idUser, height, weight, bmiIndex, status);

            res.json({ message: "Tính toán và lưu thành công", bmiIndex, status, advice });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // Lấy thông tin User
    async getUserById(req, res) {
        try {
            const idUser = req.user.idUser;
            const user = await UserModel.getUserById(idUser);
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // Chỉnh sửa thông tin User
    async updateUserInfo(req, res) {
        try {
            // Kiểm tra lỗi từ express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Lấy thông tin từ request và user (thường user sẽ có idUser từ middleware)
            const idUser = req.user.idUser;
            const { fullName, email, gender, phone } = req.body; // Thêm gender và phone

            // Cập nhật thông tin người dùng trong DB
            await UserModel.updateUserInfo(idUser, fullName, email, gender, phone);

            // Trả về phản hồi thành công
            res.status(200).json({ message: "Cập nhật thông tin thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi cập nhật thông tin", error: error.message });
        }
    }

    async changePassword(req, res) {
        try {

            const idUser = req.user.idUser;
            const { oldPassword, newPassword } = req.body;

            if(!oldPassword) return res.status(400).json({
                errors: [
                    { path: "oldPassword", msg: "Mật khẩu cũ không được để trống!" }
                ]
            });

            const user = await UserModel.getUserById(idUser);

            // Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    errors: [
                        { path: "oldPassword", msg: "Mật khẩu cũ không đúng!" }
                    ]
                });
            }

            // Kiểm tra lỗi từ express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Băm mật khẩu mới
            const salt = await bcrypt.genSalt(14);
            const newHashedPassword = await bcrypt.hash(newPassword, salt);

            await UserModel.updatePassword(idUser, newHashedPassword);
            res.json({ message: "Đổi mật khẩu thành công!" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // Lấy BMI
    async getBMIHistoryByUser(req, res) {
        try {
            const idUser = req.user.idUser;

            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const bmi = await BmiModel.getBMIByUserId(idUser, limit, offset);
            const total = await BmiModel.getTotalBMIByUserId(idUser);

            res.status(200).json({
                itemsPerPage: limit,
                currentPage: page,
                totalBMI: total,
                totalPages: Math.ceil(total / limit),
                bmi: bmi
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // Tìm kiếm BMI
    async filterBMI(req, res) {
        try {
            const idUser = req.user.idUser;
            const { status, fromDate, toDate } = req.query;
            
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;
    
            // Gọi phương thức filterBMIByUser với các tham số
            const bmi= await BmiModel.filterBMIByUser(idUser, status, fromDate, toDate, limit, offset);
            const total = await BmiModel.getTotalBMIByUserId(idUser);
    
            res.status(200).json({
                itemsPerPage: limit,
                currentPage: page,
                totalBMI: total,
                totalPages: Math.ceil(total / limit),
                bmi: bmi
            });;  // Trả về dữ liệu BMI
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
        }
    }

    // User xóa mềm
    async softDeleteUser(req, res) {
        try {
            const idBMI = req.params.idBMI;
            await BmiModel.softDeleteBMIByUser(idBMI);
            res.status(200).json({ message: 'Bản ghi đã được xóa, đến thùng rác để khôi phục', is_deleted_by_use: true });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // Lấy bản ghi đã xóa của User
    async getSoftDeletedBmiByUserId(req, res){
        try {
            const idUser = req.user.idUser;

            const data = await BmiModel.getSoftDeletedBmiByUserId(idUser);
            return res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // Khôi phục bản ghi đã xóa
    async recoverBMI(req, res) {
        try {
            const idBMI = req.params.idBMI;
            await BmiModel.recoverBMI(idBMI);
            res.status(200).json({ message: 'Bản ghi đã được khôi phục', is_deleted_by_use: false });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // User xóa hản hản ghi
    async deleteByUser(req, res) {
        try {
            const idBMI = req.params.idBMI;
            await BmiModel.deleteByUser(idBMI);
            res.status(200).json({ message: 'Bản ghi đã xóa thành công', is_delete: true });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }
}

module.exports = new UserController();