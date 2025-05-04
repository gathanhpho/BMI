const pool = require("../../config/DB/index");

const BmiModel = {
    // Lưu bản ghi BMI 
    saveBMI: async (idUser, height, weight, bmiIndex, status) => {
        await pool.execute(
            "INSERT INTO bmi_records (id_user, height, weight, bmi_index, status) VALUES (?, ?, ?, ?, ?)",
            [idUser, height, weight, bmiIndex, status]
        );
    },

    // Lấy BMI cho User
    getBMIByUserId: async (idUser, limit, offset) => {
        const [rows] = await pool.query("SELECT * FROM bmi_records WHERE id_user =? AND is_deleted_by_user = 0 ORDER BY created_at DESC  LIMIT ? OFFSET ?", [idUser, limit, offset]);
        return rows;
    },

    getTotalBMIByUserId: async (idUser) => {
        const [rows] = await pool.execute("SELECT COUNT(*) AS totalBMIByUserId FROM bmi_records WHERE id_user =? AND is_deleted_by_user = 0",[idUser]);
        return rows[0].totalBMIByUserId;
    },

    // Lọc BMI cho User
    filterBMIByUser: async (idUser, status, fromDate, toDate, limit, offset) => {
        let query = "SELECT * FROM bmi_records WHERE id_user = ?";
        const params = [idUser];

        if (status) {
            query += " AND status = ?";
            params.push(status);
        }

        if (fromDate && toDate) {
            query += " AND created_at BETWEEN ? AND ?";
            params.push(fromDate, toDate);
        }

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);
        return rows;
    },

    // Xóa mền cho user
    softDeleteBMIByUser: async (idBMI) => {
        const [result] = await pool.execute('UPDATE bmi_records SET is_deleted_by_user = 1 WHERE id_bmi = ?', [idBMI]);
        return result;
    },

    // Lấy bản ghi mà user đã xóa 
    getSoftDeletedBmiByUserId: async (idUser) => {
        const [rows] = await pool.execute(
            "SELECT * FROM bmi_records WHERE is_deleted_by_user = 1 AND is_delete = 0 AND id_user = ?",
            [idUser]
        );
        return rows;
    },

    // Khôi phục BMI cho user
    recoverBMI: async (idBMI) => {
        const [result] = await pool.execute('UPDATE bmi_records SET is_deleted_by_user = 0 WHERE id_bmi = ?', [idBMI]);
        return result;
    },

    // User xóa hằn bản ghi
    deleteByUser: async (idBMI) => {
        const [result] = await pool.execute('UPDATE bmi_records SET is_delete = 1 WHERE id_bmi = ?', [idBMI]);
        return result;
    },

    // Lấy tổng số lượng BMI
    getTotalBMI: async () => {
        const [rows] = await pool.execute("SELECT COUNT(*) AS totalBMIHistory FROM bmi_records");
        return rows[0].totalBMIHistory;
    },

    // Lấy số lượng người theo từng nhóm BMI (Cho biểu đồ tròn)
    getBMIByStatus: async () => {
        const sql = `
            SELECT status, COUNT(*) AS count
            FROM bmi_records
            GROUP BY status
        `;
        const [rows] = await pool.execute(sql);
        // console.log("Dữ liệu từ MySQL:", rows); 
        return rows;
    },

    // Lấy dữ liệu BMI theo tháng (Cho biểu đồ đường)
    getBMIByMonth: async () => {
        const sql = `
            SELECT 
                MONTH(created_at) AS month,
                SUM(CASE WHEN status = 'Thiếu cân' THEN 1 ELSE 0 END) AS underweight,
                SUM(CASE WHEN status = 'Bình thường' THEN 1 ELSE 0 END) AS normal,
                SUM(CASE WHEN status = 'Thừa cân' THEN 1 ELSE 0 END) AS overweight,
                SUM(CASE WHEN status = 'Béo phì' THEN 1 ELSE 0 END) AS obese
            FROM bmi_records
            GROUP BY month
            ORDER BY month;
        `;
        const [rows] = await pool.execute(sql);
        // console.log(rows);
        return rows;
    },

    // Lấy tất cả bản ghi BMI
    getAllBMI: async (limit, offset) => {
        const [rows] = await pool.query(
            `SELECT 
                users.full_name,
                users.email,
                bmi_records.*
            FROM bmi_records
            INNER JOIN users ON bmi_records.id_user = users.id_user
            ORDER BY bmi_records.created_at DESC
            LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    },

    // Tìm kiếm BMI
    searchBMI: async (keyword, fromDate, toDate, status, limit, offset) => {
        let query = `
            SELECT 
                users.full_name,
                users.email,
                bmi_records.height,
                bmi_records.weight,
                bmi_records.bmi_index,
                bmi_records.status,
                bmi_records.created_at
            FROM bmi_records
            INNER JOIN users ON bmi_records.id_user = users.id_user
            WHERE 1=1
        `;
        const values = [];

        // Tìm theo tên
        if (keyword) {
            query += " AND users.full_name LIKE ?";
            values.push(`%${keyword}%`);
        }

        // Tìm theo khoảng ngày
        if (fromDate && toDate) {
            query += " AND DATE(bmi_records.created_at) BETWEEN ? AND ?";
            values.push(fromDate, toDate);
        }

        // Tìm theo status
        if (status) {
            query += " AND bmi_records.status = ?";
            values.push(status);
        }

        // Thêm phân trang
        query += " ORDER BY bmi_records.created_at DESC LIMIT ? OFFSET ?";
        values.push(limit, offset);

        const [rows] = await pool.query(query, values);
        return rows;
    },

    // Xóa mềm admin
    softDeleteBMIByAdmin: async (idBMI) => {
        const [result] = await pool.execute('UPDATE bmi_records SET is_deleted_by_admin = 1 WHERE id_bmi = ?', [idBMI]);
        return result;
    },

    // Lấy bản ghi mà admin đã xóa mềm
    getSoftDeleteBMIByAdmin: async () => {
        const [result] = await pool.execute(`SELECT 
            users.full_name,
            users.email,
            bmi_records.id_bmi,
            bmi_records.height,
            bmi_records.weight,
            bmi_records.bmi_index,
            bmi_records.status,
            bmi_records.created_at
        FROM bmi_records
        INNER JOIN users ON bmi_records.id_user = users.id_user
        WHERE is_deleted_by_admin = 1`);
        return result;
    },

    // Khôi phục bmi 
    recoverBMIByAdmin: async (idBMI) => {
        const [result] = await pool.execute('UPDATE bmi_records SET is_deleted_by_admin = 0 WHERE id_bmi = ?', [idBMI]);
        return result;
    },

    // Xóa BMi vĩnh viễn
    deleteByIdBMI: async (idBMI) => {
        const [result] = await pool.execute("DELETE FROM bmi_records WHERE id_bmi = ?", [idBMI]);
        return result;
    },

}

module.exports = BmiModel;
