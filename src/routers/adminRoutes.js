const express = require("express");
const routers = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const AdminController = require("../app/controllers/AdminController");


routers.get('/total-users', authMiddleware(["admin"]), AdminController.getTotalUsers);
routers.get('/total-bmi-history', authMiddleware(["admin"]), AdminController.getTotalBMI);
routers.get("/status-by-status", authMiddleware(["admin"]), AdminController.getBMIStatus);
routers.get('/status-by-month', authMiddleware(["admin"]), AdminController.getBMIStatsByMonth);
routers.get('/getAllUser', authMiddleware(["admin"]), AdminController.getAllUsers);
routers.get('/searchUser', authMiddleware(["admin"]), AdminController.searchUser);
routers.patch('/softDeleteUserByAdmin/:idUser', authMiddleware(["admin"]), AdminController.softDeleteUserByAdmin);
routers.get('/getAllUserSoftDelete', authMiddleware(["admin"]), AdminController.getAllUserSoftDelete);
routers.patch('/recoverUser/:idUser', authMiddleware(["admin"]), AdminController.recoverUser);
routers.delete('/deleteUser/:idUser', authMiddleware(["admin"]), AdminController.deleteUser);
routers.get('/getAllBMI', authMiddleware(["admin"]), AdminController.getAllBMI);
routers.get('/searchBMI', authMiddleware(["admin"]), AdminController.searchBMI);
routers.patch('/softDeleteByIdBMI/:idBMI', authMiddleware(["admin"]), AdminController.softDeleteByIdBMI);
routers.get('/getSoftDeleteBMIByAdmin', authMiddleware(["admin"]), AdminController.getSoftDeleteBMIByAdmin);
routers.patch('/recoverBMIByAdmin/:idBMI', authMiddleware(["admin"]), AdminController.recoverBMIByAdmin);
routers.delete('/deleteBMI/:idBMI', authMiddleware(["admin"]), AdminController.deleteByIdBMI);

module.exports = routers;