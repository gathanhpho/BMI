const express = require("express");
const routers = express.Router();

const authController = require("../app/controllers/AuthController");

routers.post("/register", authController.register);
routers.post("/login", authController.login);

module.exports = routers;
 