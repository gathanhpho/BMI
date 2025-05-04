const express = require("express");
const routers = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validateBMIInput = require("../middlewares/validateUsers/validateBMIInput");
const validateInfo= require("../middlewares/validateUsers/validateInfo");
const validateChangePassword = require("../middlewares/validateUsers/validateChangePassword");
const userController = require("../app/controllers/UserController");
 
routers.post("/BMI",authMiddleware(["user"]),validateBMIInput , userController.BMIUser);
routers.get("/userInfo",authMiddleware(["user"]), userController.getUserById);
routers.put("/updateInfo",authMiddleware(["user"]),validateInfo, userController.updateUserInfo);
routers.post("/changePassword",authMiddleware(["user"]),validateChangePassword, userController.changePassword);
routers.get("/history",authMiddleware(["user"]), userController.getBMIHistoryByUser);
routers.get("/filter",authMiddleware(["user"]), userController.filterBMI);
routers.patch("/softDelete/:idBMI",authMiddleware(["user"]), userController.softDeleteUser);
routers.get("/trash",authMiddleware(["user"]), userController.getSoftDeletedBmiByUserId);
routers.patch("/recoverBMI/:idBMI",authMiddleware(["user"]), userController.recoverBMI);
routers.patch("/delete/:idBMI",authMiddleware(["user"]), userController.deleteByUser);


module.exports = routers;