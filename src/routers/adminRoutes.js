const express = require("express");
const routers = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const AdminController = require("../app/controllers/AdminController");

routers.get("/status-by-status", authMiddleware(["admin"]), AdminController.getBMIStatus);
routers.get('/status-by-month', authMiddleware(["admin"]), AdminController.getBMIStatsByMonth);
routers.get('/total-users', authMiddleware(["admin"]), AdminController.getTotalUsers);
routers.get('/total-bmi-history', authMiddleware(["admin"]), AdminController.getTotalBMIRecords);
routers.get('/getAllUser', authMiddleware(["admin"]), AdminController.getAllUsers);
routers.get('/searchUser', authMiddleware(["admin"]), AdminController.searchUser);
routers.get('/getAllBMI', authMiddleware(["admin"]), AdminController.getAllBMI);
routers.get('/searchBMI', authMiddleware(["admin"]), AdminController.searchBMI);
routers.delete('/delete/:idBMI', authMiddleware(["admin"]), AdminController.deleteByIdBMI);

module.exports = routers;