const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const corsMiddleware = require("../middlewares/corsMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const digitalSignatureController = require("../controllers/digitalSignatureController");

router.get(
  "/getsignature",
  corsMiddleware,
  authMiddleware.protect,
  digitalSignatureController.getDigitalSignature
);

router.post(
  "/addsignature",
  corsMiddleware,
  upload.single("file"),
  authMiddleware.protect,
  digitalSignatureController.addDigitalSignature
);

router.patch(
  "/editsignature",
  corsMiddleware,
  upload.single("file"),
  authMiddleware.protect,
  digitalSignatureController.editDigitalSignature
);

module.exports = router;
