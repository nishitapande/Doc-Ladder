const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const corsMiddleware = require("../middlewares/corsMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const fileController = require("../controllers/fileController");

//GET ALL FILES
router.get(
  "/",
  corsMiddleware,
  authMiddleware.protect,
  fileController.getAllFiles
);

// GET ALL FILES PER PARAMS
router.get(
  "/getFiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.connectToDatabase,
  fileController.getFiles
);

// JUST ADD SIGNATURE
router.patch(
  "/signfile/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.fetchDigitalSignature,
  fileController.getPdf,
  fileController.getSignaturesRequiredForEditing,
  fileController.editToAddDigitalSignature,
  fileController.justSignUpadte
);

// ADD SIGNATURE TO FILE AND FORWARD FOR APPROVAL
router.patch(
  "/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.fetchDigitalSignature,
  fileController.getPdf,
  fileController.getSignaturesRequiredForEditing,
  fileController.editToAddDigitalSignature,
  fileController.updateThePdf,
  fileController.sendFileTo
);

//GET FILE BY ID
router.get(
  "/getasignedfile/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.getFileById
);

//GET ALL UNSIGNED FILES PER USER
router.get(
  "/unsignedfiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.getAllUnsignedFilePerUser
);

//UPLOAD A FILE
router.post(
  "/uploadfile",
  corsMiddleware,
  upload.single("file"),
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.validateFileUpload,
  fileController.connectToDatabase,
  fileController.insertFileWithoutSignature,
  fileController.fetchDigitalSignature,
  fileController.getSignaturesRequired,
  fileController.addDigitalSignature,
  fileController.insertFileWithSignature,
  fileController.forwardForApproval
);

//GET ALL FILES CREATED BY USER
router.get(
  "/getfilesbyuser",
  corsMiddleware,
  authMiddleware.protect,
  fileController.getAllFilesCreatedByUser
);

//DELETE FILE
router.delete(
  "/deletefile/:fileId",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.declinedFilesPerUser
);

//DECLINE A FILE
router.patch(
  "/declinefile/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.declineFile
);

//GET ALL APPROVED FILES PER USER
router.get(
  "/approvedfiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.approvedFilesPerUser
);

//GET ALL THE DECLINED FILES PER USER
router.get(
  "/declinedfiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.declinedFilesPerUser
);

//GET ALL SAVED FILES THAT ARE NOT SIGNED

router.get(
  "/savedfiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.unsignedSavedFilesPerUser
);

router.post(
  "/sendfile/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.sendFileTo
);

module.exports = router;
