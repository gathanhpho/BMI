const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "web_BMI",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; // Xuất pool thay vì một hàm
