const express = require('express');
const routers = express.Router();

const bmiGues = require('../app/controllers/GuestBmiController');
const auth = require('./authRoutes');
const user = require('./userRoutes');
const admin = require('./adminRoutes');

const validateBMIInput = require("../middlewares/validateUsers/validateBMIInput");

function apiRouters(app) {
    routers.post("/bmi",validateBMIInput, bmiGues);
    routers.use("/auth", auth); 
    routers.use("/user", user);
    routers.use("/admin", admin);

    return app.use("/api/v1", routers);
}

module.exports = apiRouters;
