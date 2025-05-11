const express = require("express");

const router = express.Router();

const corsMiddleware = require("../middlewares/corsMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const departmentController = require("../controllers/departmentController");

router.get(
  "/alldepartments",
  corsMiddleware,
  authMiddleware.protect,
  departmentController.getAllDepartments
);

//GET A SINGLE DEPARTEMENT BY ID
router.get(
  "/getdepartment/:id",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  departmentController.getDepartmentById
);

router.post(
  "/adddepartment",
  corsMiddleware,
  authMiddleware.protect,
  departmentController.addDepartment
);

//DELETE A DEPARTMENT

router.delete(
  "/deletedepartment/:id",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  departmentController.deleteDepartment
);

//UPDATE A DEPARTMENT
router.patch(
  "/updatedepartment/:id",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  departmentController.updateDepartment
);

module.exports = router;
