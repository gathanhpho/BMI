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

// const createAdmin = async () => {
//   try {
//       const fullName = "Admin"; // Bạn có thể đổi nếu muốn
//       const email = "admin@gmail.com";
//       const password = "aicap2003"; // Đổi mật khẩu nếu cần
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const role = "admin";
//       const gender = "Nam"; // hoặc "Nam" / "Nữ"
//       const phone = "0373164489"; // Đảm bảo không trùng với dữ liệu đã có

//       await pool.execute(
//           `INSERT INTO users (full_name, email, password, role, gender, phone) 
//            VALUES (?, ?, ?, ?, ?, ?)`,
//           [fullName, email, hashedPassword, role, gender, phone]
//       );

//       console.log("Tạo tài khoản admin thành công!");
//   } catch (error) {
//       console.error("Lỗi khi tạo admin:", error);
//   } finally {
//       process.exit(); // Thoát chương trình sau khi chạy
//   }
// };

// // Gọi hàm tạo admin
// createAdmin();