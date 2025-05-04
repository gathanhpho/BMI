const pool = require("../../config/DB/index");

const UserModel = {
    // Tạo User
    create: async (fullName, email, password, gender, phone) => {
        await pool.execute(
            "INSERT INTO users (full_name, email, password, gender, phone) VALUES (?, ?, ?, ?, ?)",
            [fullName, email, password, gender, phone]
        );
    },

    // Tìm user theo email
    findUserByEmail: async (email) => {
        const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        return rows.length ? rows[0] : null;
    },

    // Lấy User theo id 
    getUserById: async (idUser) => {
        const [rows] = await pool.execute("SELECT * FROM users WHERE id_user = ?", [idUser]);
        return rows.length ? rows[0] : null;
    },

    // Chỉnh sửa thông tin user
    updateUserInfo: async (idUser, fullName, email, gender, phone) => {
        await pool.execute(
            `UPDATE users 
             SET full_name = ?, email = ?, gender = ?, phone = ? 
             WHERE id_user = ?`,
            [fullName, email, gender, phone, idUser]
        );
    },

    // chỉnh sửa password
    updatePassword: async (idUser, password) => {
        await pool.execute("UPDATE users SET password = ? WHERE id_user = ?", [password, idUser]);
    },

    // Lấy số lượng User
    getTotalUsers: async () => {
        const [rows] = await pool.execute("SELECT COUNT(*) AS totalUsers FROM users ");
        return rows[0].totalUsers;
    },

    // Lấy tất cả User
    getAllUsers: async (limit, offset) => {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE is_delete = 0 ORDER BY role ASC, full_name ASC LIMIT ? OFFSET ?",
            [limit, offset]
        );
        return rows;
    },

    searchUsers: async (keyword, fromDate, toDate, limit, offset) => {
        let query = "SELECT * FROM users WHERE 1=1";
        const values = [];

        // Tìm theo tên hoặc email
        if (keyword) {
            query += " AND (full_name LIKE ? OR email LIKE ?)";
            const searchValue = `%${keyword}%`;
            values.push(searchValue, searchValue);
        }

        // Tìm theo khoảng ngày
        if (fromDate && toDate) {
            query += " AND created_at BETWEEN ? AND ?";
            values.push(fromDate, toDate);
        }

        // Thêm phân trang vào câu truy vấn
        query += " ORDER BY role ASC, full_name ASC LIMIT ? OFFSET ?";
        values.push(limit, offset);

        // Sử dụng await để đảm bảo truy vấn hoàn tất
        const [rows] = await pool.query(query, values);  // Đảm bảo sử dụng await
        return rows;  // Trả về kết quả là mảng các bản ghi
    },

    // Xóa mềm cho admin
    softDeleteUserByAdmin: async (idUser) => {
        const [rows] = await pool.execute(
            "UPDATE users SET is_delete = 1 WHERE id_user = ?",
            [idUser]
        );
        return rows;
    },

    // hiển thị những user bị xóa mềm
    getAllUserSoftDelete: async () => {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE is_delete = 1"
        );
        return rows;
    },

    // Khôi phục User
    recoverUser: async (idUser) => {
        const [rows] = await pool.execute(
            "UPDATE users SET is_delete = 0 WHERE id_user = ?",
            [idUser]
        );
        return rows;
    },

    // Xóa vĩnh viễn User
    deleteUser: async (idUser) => {
        const [rows] = await pool.execute(
            "DELETE FROM users WHERE id_user = ?",
            [idUser]
        );
        return rows;
    }
}
module.exports = UserModel;
