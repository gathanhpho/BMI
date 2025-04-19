const express = require("express");
const routers = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../app/controllers/UserController");
 
routers.get("/userInfo",authMiddleware(["user"]) , userController.getUserInfo);
routers.get("/history",authMiddleware(["user"]) , userController.getBMIHistoryByUser);
routers.get("/filter",authMiddleware(["user"]) , userController.filterBMI);
routers.post("/bmi",authMiddleware(["user"]) , userController.bmiUser);
routers.post("/changePassword",authMiddleware(["user"]) , userController.changePassword);
routers.put("/updateInfo/:idUser",authMiddleware(["user"]) , userController.updateUserInfo);
routers.patch("/delete/:idBMI",authMiddleware(["user"]) , userController.softDeleteUser);

module.exports = routers;