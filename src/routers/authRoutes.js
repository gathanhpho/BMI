const express = require("express");
const routers = express.Router();

const validateRegisterInputs = require("../middlewares/validateAuth/validateRegisterInputs");
const validateLoginInputs = require("../middlewares/validateAuth/validateLoginInputs")
const loginLimiter = require("../middlewares/validateAuth/loginLimiter")
const authController = require("../app/controllers/AuthController");

routers.post("/register",validateRegisterInputs , authController.register);
routers.post("/login",[validateLoginInputs, loginLimiter], authController.login);

module.exports = routers;
 