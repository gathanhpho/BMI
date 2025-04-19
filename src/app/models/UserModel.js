const pool = require("../../config/DB/index");

const UserModel = {
    create: async (idUser, fullName, gmail, password) => {
        await pool.execute(
            "INSERT INTO users (id_user, full_name, gmail, password) VALUES (?, ?, ?, ?)",
            [idUser, fullName, gmail, password]
        );
    },

    findByEmail: async (email) => {
        const [rows] = await pool.execute("SELECT * FROM users WHERE gmail = ?", [email]);
        return rows.length ? rows[0] : null;
    },

    getUserById: async (idUser) => {
        const [rows] = await pool.execute("SELECT * FROM users WHERE id_user = ?", [idUser]);
        return rows.length ? rows[0] : null;
    },

    updatePassword: async (idUser, password) => {
        await pool.execute("UPDATE users SET password = ? WHERE id_user = ?", [password, idUser]);
    },

    updateUserInfo: async (idUser, fullName, gmail) => {
        await pool.execute(
            "UPDATE users SET full_name = ?, gmail = ? WHERE id_user = ?",
            [fullName, gmail, idUser]
        );
    },

    getTotalUsers: async () => {
        const [rows] = await pool.execute("SELECT COUNT(*) AS totalUsers FROM users");
        return rows[0].totalUsers;
    },

    getAllUsers: async () => {
        const [rows] = await pool.execute("SELECT * FROM users ORDER BY role ASC, full_name ASC");
        return rows;
    },
    searchUsers: async (keyword, fromDate, toDate) => {
        let query = "SELECT * FROM users WHERE 1=1";
        const values = [];
    
        // Tìm theo tên hoặc gmail
        if (keyword) {
            query += " AND (full_name LIKE ? OR gmail LIKE ?)";
            const searchValue = `%${keyword}%`;
            values.push(searchValue, searchValue);
        }
    
        // Tìm theo khoảng ngày
        if (fromDate) {
            query += " AND created_at >= ?";
            values.push(fromDate);
        }
        if (toDate) {
            query += " AND created_at <= ?";
            values.push(toDate);
        }
    
        const [rows] = await pool.execute(query, values);
        return rows;
    }
};

module.exports = UserModel;
