const request = require("supertest");
const express = require("express");
const UserController = require("../app/controllers/UserController");
const UserModel = require("../app/models/UserModel");
const BmiModel = require("../app/models/BmiModel");
const bcrypt = require("bcryptjs");

jest.mock("../app/models/UserModel");
jest.mock("../app/models/BmiModel");
jest.mock("bcryptjs");

const app = express();
app.use(express.json());

// Middleware giả lập token xác thực và user
app.use((req, res, next) => {
  req.user = { idUser: "user-123" , role: "user" };
  next();
});

app.post("/bmi", UserController.bmiUser);
app.get("/userinfo", UserController.getUserInfo);
app.post("/changePassword", UserController.changePassword);
app.get("/history", UserController.getBMIHistoryByUser);
app.get("/filter", UserController.filterBMI);
app.delete("/delete/:idBMI", UserController.softDeleteUser);
app.put("/updateInfo/:idUser", UserController.updateUserInfo);

describe("UserController", () => {
  afterEach(() => jest.clearAllMocks());

  test("Tính BMI thành công", async () => {
    BmiModel.saveBMI.mockResolvedValue();
    const res = await request(app).post("/bmi").send({ height: 170, weight: 60 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bmiIndex");
  });

  test("Lấy thông tin người dùng thành công", async () => {
    UserModel.getUserById.mockResolvedValue({ idUser: "user-123", fullName: "Test" });
    const res = await request(app).get("/userinfo");
    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe("Test");
  });

  test("Đổi mật khẩu thành công", async () => {
    UserModel.getUserById.mockResolvedValue({ password: "oldHash" });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("newHash");
    UserModel.updatePassword.mockResolvedValue();

    const res = await request(app).post("/changePassword").send({
      currentPassword: "oldPassword",
      newPassword: "newPassword",
      confirmPassword: "newPassword"
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Đổi mật khẩu thành công");
  });

  test("Lấy lịch sử BMI thành công", async () => {
    BmiModel.getBMIByUserId.mockResolvedValue([{ id: 1, bmi: 22.5 }]);
    const res = await request(app).get("/history");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Lọc BMI theo trạng thái thành công", async () => {
    BmiModel.filterBMI.mockResolvedValue([{ id: 1, status: "Bình thường" }]);
    const res = await request(app).get("/filter").query({ status: "Bình thường" });
    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe("Bình thường");
  });

  test("Xoá mềm BMI thành công", async () => {
    BmiModel.softDeleteBMI.mockResolvedValue();
    const res = await request(app).delete("/delete/bmi-123");
    expect(res.status).toBe(200);
    expect(res.body.is_delete).toBe(true);
  });

  test("Cập nhật thông tin người dùng thành công", async () => {
    UserModel.updateUserInfo.mockResolvedValue();
    const res = await request(app).put("/updateInfo/user-123").send({
      fullName: "New Name",
      gmail: "new@gmail.com"
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/thành công/i);
  });
});