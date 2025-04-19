const path = require('path');
const express = require('express');
const cors = require('cors');
const methodOverride = require('method-override');
const pool = require('./config/DB/index')
const app = express();
const port = 3000;
const router = require('./routers');

app.use(methodOverride('_method'));
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
router(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// const bcrypt = require("bcryptjs");
// const { v4: uuidv4 } = require("uuid");

// const createAdmin = async () => {
//     try {
//         const idUser = uuidv4();
//         const username = "admin";
//         const email = "admin@gmail.com";
//         const password = "aicap2003"; // Đổi mật khẩu nếu cần
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const role = "admin";

//         await pool.execute(
//             "INSERT INTO users (id_user, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
//             [idUser, username, email, hashedPassword, role]
//         );

//         console.log("Tạo tài khoản admin thành công!");
//     } catch (error) {
//         console.error("Lỗi khi tạo admin:", error);
//     } finally {
//         process.exit(); // Thoát chương trình sau khi chạy
//     }
// };

// // Gọi hàm tạo admin
// createAdmin();