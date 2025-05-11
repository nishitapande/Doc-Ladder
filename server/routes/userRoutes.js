const express = require("express");
const router = express.Router();
const corsMiddleware = require("../middlewares/corsMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

router.get("/", corsMiddleware, authMiddleware.protect, userController.getUser);

router.post(
  "/signup",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  userController.registerUser
);
router.post("/login", corsMiddleware, userController.loginUser);
router.post("/forgot-password", corsMiddleware, userController.forgotPassword);
router.post(
  "/reset-password/:resetToken",
  corsMiddleware,
  userController.resetPassword
);
router.get(
  "/employeesname",
  corsMiddleware,
  authMiddleware.protect,
  userController.getAllUsers
);

router.get(
  "/getuserprofile",
  corsMiddleware,
  authMiddleware.protect,
  userController.getEmployeeProfile
);

//GET ALL EMPLOYEES
router.get(
  "/getallemployees",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  userController.getAllEmployees
);

//DELETE AN EMPLOYEE
router.delete(
  "/deleteemployee/:id",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  userController.deleteEmployee
);

module.exports = router;
