const express = require("express");
const securityController = require("../controllers/securityController");
const authMiddleware = require("../middlewares/authMiddleware");
const corsMiddleware = require("../middlewares/corsMiddleware");

const router = express.Router();

router.get(
  "/userdepartments",
  corsMiddleware,
  authMiddleware.protect,
  securityController.getUserDepartments
);

module.exports = router;
