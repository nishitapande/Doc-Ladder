const express = require("express");
const router = express.Router();
const corsMiddleware = require("../middlewares/corsMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const voucherController = require("../controllers/voucherController");

//GET ALL VOUCHERS
router.get(
  "/getvouchers",
  corsMiddleware,
  authMiddleware.protect,
  voucherController.getAllVoucher
);

//GET VOUCHER BY ID

router.get(
  "/getvoucher/:id",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  voucherController.getVoucherById
);
//ADD VOUCHERS
router.post(
  "/addnewvoucher",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  voucherController.createNewVoucher
);

//DELETE A VOUCHER
router.delete(
  "/deletevoucher/:id",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  voucherController.deleteVoucher
);

//UPDATE VOUCHER

router.patch(
  "/updatevoucher/:id",
  corsMiddleware,
  authMiddleware.protect,
  authMiddleware.isAdmin,
  voucherController.updateVoucher
);

module.exports = router;
