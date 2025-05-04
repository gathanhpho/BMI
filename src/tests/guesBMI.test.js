const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const bmiGues = require('../app/controllers/GuestBmiController'); // Cập nhật đúng đường dẫn
const validateBMIInput = require('../middlewares/validateUsers/validateBMIInput'); // Cập nhật đúng đường dẫn

const app = express();
app.use(bodyParser.json());

// Tạo route giả lập để test
app.post('/bmi', validateBMIInput, bmiGues);

describe('POST /bmi', () => {

    test('Thiếu cân', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 45, height: 170 });

        expect(res.statusCode).toBe(200);
        expect(res.body.bmi).toBe("15.57");
        expect(res.body.advice).toMatch(/thiếu cân/i);
    });

    test('Cân nặng lý tưởng', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 60, height: 170 });

        expect(res.statusCode).toBe(200);
        expect(res.body.bmi).toBe("20.76");
        expect(res.body.advice).toMatch(/lý tưởng/i);
    });

    test('Thừa cân', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 75, height: 170 });

        expect(res.statusCode).toBe(200);
        expect(res.body.bmi).toBe("25.95");
        expect(res.body.advice).toMatch(/thừa cân/i);
    });

    test('Béo phì', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 95, height: 170 });

        expect(res.statusCode).toBe(200);
        expect(res.body.bmi).toBe("32.87");
        expect(res.body.advice).toMatch(/béo phì/i);
    });

});

describe('❌ Kiểm tra validate input từ middleware', () => {

    test('Thiếu chiều cao', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 60 });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('Chiều cao không được để trống');
    });

    test('Chiều cao dưới 50', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 60, height: 40 });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('Chiều cao phải giữa 50cm và 250cm!');
    });

    test('Chiều cao trên 250', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 60, height: 300 });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('Chiều cao phải giữa 50cm và 250cm!');
    });

    test('Thiếu cân nặng', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ height: 170 });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('Cân nặng không được để trống');
    });

    test('Cân nặng dưới 10kg', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 5, height: 170 });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('Cân nặng phải từ 10kg đến 300kg!');
    });

    test('Cân nặng trên 300kg', async () => {
        const res = await request(app)
            .post('/bmi')
            .send({ weight: 350, height: 170 });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('Cân nặng phải từ 10kg đến 300kg!');
    });

});
