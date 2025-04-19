const request = require("supertest");
const express = require("express");
const bmiGues = require("../app/controllers/GuestBmiController");

const app = express();
app.use(express.json());
app.post("/bmi", bmiGues);

describe("POST /bmi", () => {
  it("Trả về lỗi nếu thiếu cân nặng hoặc chiều cao", async () => {
    const res = await request(app).post("/bmi").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Vui lòng nhập đầy đủ cân nặng và chiều cao!");
  });

  it("Trả về lỗi nếu cân nặng không hợp lệ", async () => {
    const res = await request(app).post("/bmi").send({ weight: -10, height: 170 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Cân nặng phải lớn hơn 0 và nhỏ hơn 200!");
  });

  it("Trả về lỗi nếu chiều cao không hợp lệ", async () => {
    const res = await request(app).post("/bmi").send({ weight: 60, height: 300 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Chiều cao phải lớn hơn 0 và nhỏ hơn 250!");
  });

  it("Trả về BMI và tư vấn đúng khi thiếu cân", async () => {
    const res = await request(app).post("/bmi").send({ weight: 45, height: 170 });
    expect(res.status).toBe(200);
    expect(res.body.bmi).toBe("15.57");
    expect(res.body.advice).toMatch(/thiếu cân/);
  });

  it("Trả về BMI và tư vấn đúng khi lý tưởng", async () => {
    const res = await request(app).post("/bmi").send({ weight: 60, height: 170 });
    expect(res.status).toBe(200);
    expect(res.body.bmi).toBe("20.76");
    expect(res.body.advice).toMatch(/lý tưởng/);
  });

  it("Trả về BMI và tư vấn đúng khi thừa cân", async () => {
    const res = await request(app).post("/bmi").send({ weight: 75, height: 170 });
    expect(res.status).toBe(200);
    expect(res.body.bmi).toBe("25.95");
    expect(res.body.advice).toMatch(/thừa cân/);
  });

  it("Trả về BMI và tư vấn đúng khi béo phì", async () => {
    const res = await request(app).post("/bmi").send({ weight: 100, height: 160 });
    expect(res.status).toBe(200);
    expect(res.body.bmi).toBe("39.06");
    expect(res.body.advice).toMatch(/béo phì/);
  });
});
