const request = require("supertest");
const express = require("express");
const AdminController = require("../app/controllers/AdminController");
const UserModel = require("../app/models/UserModel");
const BmiModel = require("../app/models/BmiModel");

jest.mock("../app/models/UserModel");
jest.mock("../app/models/BmiModel");

const app = express();
app.use(express.json());

// Giả lập middleware xác thực
app.use((req, res, next) => {
  req.user = { idUser: "admin-123", role: "admin" }; // Giả lập admin
  next();
});

// Các route của AdminController
app.get("/status-by-status", AdminController.getBMIStatus);
app.get('/status-by-month', AdminController.getBMIStatsByMonth);
app.get('/total-users', AdminController.getTotalUsers);
app.get('/total-bmi-history', AdminController.getTotalBMIRecords);
app.get('/getAllUser', AdminController.getAllUsers);
app.get('/searchUser', AdminController.searchUser);
app.get('/getAllBMI', AdminController.getAllBMI);
app.get('/searchBMI', AdminController.searchBMI);
app.delete('/delete/:idBMI', AdminController.deleteByIdBMI);

describe("AdminController", () => {
  afterEach(() => jest.clearAllMocks());

  // Test getBMIStatus
  test("Lấy thống kê BMI theo trạng thái", async () => {
    BmiModel.getBMIByStatus.mockResolvedValue([
      { status: "Thiếu cân", count: 10 },
      { status: "Bình thường", count: 20 },
      { status: "Thừa cân", count: 15 },
      { status: "Béo phì", count: 5 },
    ]);
    const res = await request(app).get("/status-by-status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("labels");
    expect(res.body.labels).toEqual(["Thiếu cân", "Bình thường", "Thừa cân", "Béo phì"]);
    expect(res.body.values).toEqual([10, 20, 15, 5]);
  });

  // Test getBMIStatsByMonth
  test("Lấy thống kê BMI theo tháng", async () => {
    BmiModel.getBMIByMonth.mockResolvedValue([
      { month: 1, underweight: 5, normal: 10, overweight: 3, obese: 2 },
      { month: 2, underweight: 6, normal: 12, overweight: 4, obese: 3 },
    ]);
    const res = await request(app).get("/status-by-month");
    expect(res.status).toBe(200);
    expect(res.body.labels).toEqual(["Tháng 1", "Tháng 2"]);
    expect(res.body.underweight).toEqual([5, 6]);
    expect(res.body.normal).toEqual([10, 12]);
    expect(res.body.overweight).toEqual([3, 4]);
    expect(res.body.obese).toEqual([2, 3]);
  });

  // Test getTotalUsers
  test("Lấy tổng số người dùng", async () => {
    UserModel.getTotalUsers.mockResolvedValue(100);
    const res = await request(app).get("/total-users");
    expect(res.status).toBe(200);
    expect(res.body).toBe(100);
  });

  // Test getTotalBMIRecords
  test("Lấy tổng số bản ghi BMI", async () => {
    BmiModel.getTotalBMIHistory.mockResolvedValue(200);
    const res = await request(app).get("/total-bmi-history");
    expect(res.status).toBe(200);
    expect(res.body).toBe(200);
  });

  // Test getAllUsers
  test("Lấy tất cả người dùng", async () => {
    UserModel.getAllUsers.mockResolvedValue([{ idUser: "user-123", fullName: "Test User" }]);
    const res = await request(app).get("/getAllUser");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ idUser: "user-123", fullName: "Test User" }]);
  });

  // Test searchUser
  test("Tìm kiếm người dùng", async () => {
    UserModel.searchUsers.mockResolvedValue([{ idUser: "user-123", fullName: "Test User" }]);
    const res = await request(app).get("/searchUser").query({ keyword: "Test" });
    expect(res.status).toBe(200);
    expect(res.body[0].fullName).toBe("Test User");
  });

  // Test getAllBMI
  test("Lấy tất cả bản ghi BMI", async () => {
    BmiModel.getAllBMI.mockResolvedValue([{ idBMI: 1, bmi: 22.5 }]);
    const res = await request(app).get("/getAllBMI");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ idBMI: 1, bmi: 22.5 }]);
  });

  // Test searchBMI
  test("Tìm kiếm BMI", async () => {
    BmiModel.searchBMIRecords.mockResolvedValue([{ idBMI: 1, bmi: 22.5, status: "Bình thường" }]);
    const res = await request(app).get("/searchBMI").query({ status: "Bình thường" });
    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe("Bình thường");
  });

  // Test deleteByIdBMI
  test("Xóa mềm BMI thành công", async () => {
    BmiModel.deleteByIdBMI.mockResolvedValue();
    const res = await request(app).delete("/delete/bmi-123");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Tài khoản đã được đánh dấu xoá");
  });
});
