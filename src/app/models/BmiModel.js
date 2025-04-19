const pool = require("../../config/DB/index");

const BmiModel = {
    saveBMI: async (idBMI, idUser, height, weight, bmiIndex, status) => {
        await pool.execute(
            "INSERT INTO bmi_records (id_bmi, id_user, height, weight, bmi_index, status) VALUES (?, ?, ?, ?, ?, ?)",
            [idBMI, idUser, height, weight, bmiIndex, status]
        );
    },

    findByUserId: async (idUser) => {
        const [rows] = await pool.execute("SELECT * FROM bmi_records WHERE id_user = ?", [idUser]);
        return rows.length ? rows : null;
    },

    getBMIByUserId: async (idUser) => {
        const [rows] = await pool.execute("SELECT * FROM bmi_records WHERE id_user =? AND is_deleted = 0 ORDER BY created_at DESC", [idUser]);
        return rows;
    },

    filterBMI: async (idUser, status) => {
        const [rows] = await pool.execute("SELECT * FROM bmi_records WHERE id_user = ? AND status = ? ORDER BY created_at DESC", [idUser, status]);
        return rows;
    },

    softDeleteBMI: async (idBMI) => {
        const [result] = await pool.execute('UPDATE bmi_records SET is_deleted = 1 WHERE id_bmi = ?', [idBMI]);
        return result;
    },

    deleteByIdBMI: async (idBMI) => {
        const [result] = await pool.execute("DELETE FROM bmi_records WHERE id_bmi = ?", [idBMI]);
        return result;
    },

    // Lấy số lượng người theo từng nhóm BMI (Cho biểu đồ tròn)
    getBMIByStatus: async () => {
        const sql = `
            SELECT status, COUNT(*) AS count
            FROM bmi_records
            GROUP BY status
            ORDER BY FIELD(status, 'Thiếu cân', 'Bình thường', 'Thừa cân', 'Béo phì');
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

    getTotalBMIHistory: async () => {
        const [rows] = await pool.execute("SELECT COUNT(*) AS totalBMIHistory FROM bmi_records");
        return rows[0].totalBMIHistory;
    },

    getAllBMI: async () => {
        const [rows] = await pool.execute(`SELECT 
            users.full_name,
            users.gmail,
            bmi_records.*
            FROM bmi_records
            JOIN users ON bmi_records.id_user = users.id_user
            ORDER BY bmi_records.created_at DESC`);
        return rows;
    },

    searchBMIRecords: async (keyword, fromDate, toDate, status) => {
        let query = `
            SELECT 
                users.full_name,
                users.gmail,
                bmi_records.height,
                bmi_records.weight,
                bmi_records.bmi_index,
                bmi_records.status,
                bmi_records.created_at
            FROM bmi_records
            JOIN users ON bmi_records.id_user = users.id_user
            WHERE 1=1
        `;

        const values = [];

        // Tìm theo tên
        if (keyword) {
            query += " AND users.full_name LIKE ?";
            values.push(`%${keyword}%`);
        }

        // Tìm theo khoảng ngày
        if (fromDate) {
            query += " AND bmi_records.created_at >= ?";
            values.push(fromDate);
        }

        if (toDate) {
            query += " AND bmi_records.created_at <= ?";
            values.push(toDate);
        }

        // Tìm theo status
        if (status) {
            query += " AND bmi_records.status = ?";
            values.push(status);
        }

        query += " ORDER BY bmi_records.created_at DESC";

        const [rows] = await pool.execute(query, values);
        return rows;
    }
}

module.exports = BmiModel;
