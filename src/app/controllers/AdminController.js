const BmiModel = require("../models/BmiModel");
const UserModel = require("../models/UserModel");

class AdminController {
    async getBMIStatus(req, res) {
        try {
            const data = await BmiModel.getBMIByStatus();

            // Chuyển đổi dữ liệu về đúng định dạng cho frontend
            const responseData = {
                labels: data.map(item => item.status), // ["Thiếu cân", "Bình thường", "Thừa cân", "Béo phì"]
                values: data.map(item => item.count) // [10, 20, 15, 5]
            };
            res.json(responseData);

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

    async getTotalUsers(req, res) {
        try {
            const totalUsers = await UserModel.getTotalUsers();
            res.json(totalUsers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTotalBMIRecords(req, res) {
        try {
            const totalBMIRecords = await BmiModel.getTotalBMIHistory();
            res.json(totalBMIRecords);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await UserModel.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async searchUser(req, res) {
        try {
            const { keyword, fromDate, toDate } = req.query;
            const users = await UserModel.searchUsers(keyword, fromDate, toDate);
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllBMI(req, res) {
        try {
            const history = await BmiModel.getAllBMI();
            res.json(history);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async searchBMI(req, res) {
        try {
            const { keyword, fromDate, toDate, status } = req.query;

            const searchBMIHistory = await BmiModel.searchBMIRecords(keyword, fromDate, toDate, status);

            res.status(200).json(searchBMIHistory);
        } catch (error) {
            res.status(500).json({ message: "Lỗi cập nhật thông tin", error: error.message });
        }
    }

    async deleteByIdBMI(req, res) {
        try {
            const idBMI = req.params.idBMI;
            await BmiModel.deleteByIdBMI(idBMI);
            res.json({ message: 'Tài khoản đã được đánh dấu xoá' });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error: error.message })
        }
    }
}

module.exports = new AdminController();