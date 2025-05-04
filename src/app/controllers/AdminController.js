const BmiModel = require("../models/BmiModel");
const UserModel = require("../models/UserModel");

class AdminController {
    // Lấy tổng số user
    async getTotalUsers(req, res) {
        try {
            const totalUsers = await UserModel.getTotalUsers();
            res.status(200).json(totalUsers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy tổng số BMI
    async getTotalBMI(req, res) {
        try {
            const totalBMIRecords = await BmiModel.getTotalBMI();
            res.json(totalBMIRecords);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy dữ liệu cho Biểu đồ tròn Chart
    async getBMIStatus(req, res) {
        try {
            const data = await BmiModel.getBMIByStatus();

            // Chuyển đổi dữ liệu về đúng định dạng cho frontend
            const responseData = {
                labels: data.map(item => item.status), // ["Thiếu cân", "Bình thường", "Thừa cân", "Béo phì"]
                values: data.map(item => item.count) // [10, 20, 15, 5]
            };
            res.status(200).json(responseData);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy dữ liệu cho Line Chart
    async getBMIStatsByMonth(req, res) {
        try {
            const data = await BmiModel.getBMIByMonth();

            // 🟢 Chuẩn bị dữ liệu theo đúng format
            const labels = data.map(item => `Tháng ${item.month}`);
            const underweight = data.map(item => item.underweight);
            const normal = data.map(item => item.normal);
            const overweight = data.map(item => item.overweight);
            const obese = data.map(item => item.obese);

            // 🔵 Trả về JSON theo format chuẩn cho biểu đồ
            res.json({
                labels,
                underweight,
                normal,
                overweight,
                obese
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // lấy user
    async getAllUsers(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;


            const users = await UserModel.getAllUsers(limit, offset);
            const total = await UserModel.getTotalUsers();

            res.status(200).json({
                itemsPerPage: limit,
                currentPage: page,
                totalUsers: total,
                totalPages: Math.ceil(total / limit),
                users
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Tìm kiếm User
    async searchUser(req, res) {
        try {
            const { keyword, fromDate, toDate } = req.query;

            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            // Gọi hàm searchUsers với các tham số tìm kiếm và phân trang
            const users = await UserModel.searchUsers(keyword, fromDate, toDate, limit, offset);
            const total = await UserModel.getTotalUsers();

            // Tính tổng số trang
            const totalPages = Math.ceil(total / limit);

            // Trả về dữ liệu theo yêu cầu
            res.status(200).json({
                itemsPerPage: limit,
                currentPage: page,
                totalUsers: total,
                totalPages: totalPages,
                users: users
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // admin xóa mềm User
    async softDeleteUserByAdmin(req, res) {
        try {
            const idUser = req.params.idUser;
            await UserModel.softDeleteUserByAdmin(idUser);
            res.status(200).json({ message: 'Người dùng đã được xóa, đến thùng rác để khôi phục', is_delete: true });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // Lấy bản ghi đã xóa của User
    async getAllUserSoftDelete(req, res) {
        try {
            const data = await UserModel.getAllUserSoftDelete();
            return res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // Khôi phục bản ghi đã xóa
    async recoverUser(req, res) {
        try {
            const idUser = req.params.idUser;
            await UserModel.recoverUser(idUser);
            res.status(200).json({ message: 'Người dùng đã được khôi phục', is_deleted: false });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // Xóa user vĩnh viễn
    async deleteUser(req, res) {
        try {
            const idUser = req.params.idUser;
            await UserModel.deleteUser(idUser);
            res.status(200).json({ message: 'Đã xóa người dùng vĩnh viễn.' });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // Lấy tất cả bản ghi BMI
    async getAllBMI(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;


            const bmi = await BmiModel.getAllBMI(limit, offset);
            const total = await BmiModel.getTotalBMI();

            res.status(200).json({
                itemsPerPage: limit,
                currentPage: page,
                totalBMI: total,
                totalPages: Math.ceil(total / limit),
                bmi: bmi
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Tìm kiếm BMI
    async searchBMI(req, res) {
        try {
            const { keyword, fromDate, toDate, status} = req.query;

            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            // Gọi hàm model để tìm BMI theo điều kiện
            const bmi = await BmiModel.searchBMI(keyword, fromDate, toDate, status, limit, offset);
            const total = await BmiModel.getTotalBMI();

            const totalPages = Math.ceil(total / limit);

            res.status(200).json({
                itemsPerPage: limit,
                currentPage: parseInt(page),
                totalBMI: total,
                totalPages: totalPages,
                bmi: bmi
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Xóa mềm bmi admin
    async softDeleteByIdBMI(req, res) {
        try {
            const idBMI = req.params.idBMI;
            await BmiModel.softDeleteBMIByAdmin(idBMI);
            res.json({ message: 'Bản ghi đã được xóa, đến thùng rác để khôi phục', is_deleted_by_admin: true });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // lấy những bảng xóa mêm bmi cho admin
    async getSoftDeleteBMIByAdmin(req, res) {
        try {
            
            const bmi = await BmiModel.getSoftDeleteBMIByAdmin();
            res.status(200).json(bmi);
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    // Khôi phục BMI
    async recoverBMIByAdmin(req, res) {
        try {
            const idBMI = req.params.idBMI;
            await BmiModel.recoverBMIByAdmin(idBMI);
            res.json({ message: 'Bản ghi đã được khôi phục', is_deleted_by_admin: false });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

    async deleteByIdBMI(req, res) {
        try {
            const idBMI = req.params.idBMI;
            await BmiModel.deleteByIdBMI(idBMI);
            res.json({ message: 'Xóa bản ghi thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }

}

module.exports = new AdminController();