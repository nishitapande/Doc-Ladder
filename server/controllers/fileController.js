const { PDFDocument } = require("pdf-lib");
const prisma = require("../config/prisma");
const storageService = require("../services/storageService");
const { success, error } = require("../utils/response");

// Helper to format file response for React client
const formatFile = (file) => ({
  id: file.id,
  FILE_ID: file.id,
  fileName: file.fileName,
  FILE_NAME: file.fileName,
  fileUrl: file.fileUrl,
  storageKey: file.storageKey,
  createdOn: file.createdAt,
  CREATED_ON: file.createdAt,
  remarks: file.remarks,
  REMARKS: file.remarks,
  signedByUploader: file.signedByUploader,
  SIGNED_BY_UPLOADER: file.signedByUploader,
  signaturesDone: file.signaturesDone,
  SIGNATURES_DONE: file.signaturesDone,
  isSignedByAll: file.isSignedByAll,
  SIGNED_BY_ALL: file.isSignedByAll,
  voucherId: file.voucherTypeId,
  VOUCHER_ID: file.voucherTypeId,
  voucherName: file.voucherType?.name || "",
  VOUCHER_NAME: file.voucherType?.name || "",
  signaturesRequired: file.voucherType?.signaturesRequired || 1,
  SIGNATURES_REQUIRED: file.voucherType?.signaturesRequired || 1,
  departmentId: file.departmentId,
  DEPARTMENT_ID: file.departmentId,
  departmentName: file.department?.name || "",
  DEPARTMENT_NAME: file.department?.name || "",
  createdById: file.createdById,
  CREATED_BY: file.createdById,
  creatorName: file.createdBy
    ? `${file.createdBy.firstName || ""} ${file.createdBy.lastName || ""}`.trim()
    : "",
  NAME: file.createdBy
    ? `${file.createdBy.firstName || ""} ${file.createdBy.lastName || ""}`.trim()
    : "",
  status: file.status,
  STATUS: file.status,
});

// 1. GET ALL COMPLETED / FULLY SIGNED FILES
exports.getAllFiles = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  try {
    const files = await prisma.file.findMany({
      where: {
        organizationId: organizationId || undefined,
        isSignedByAll: true,
        deletedAt: null,
      },
      include: {
        department: true,
        createdBy: true,
        voucherType: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return success(res, files.map(formatFile), "All completed files fetched");
  } catch (err) {
    console.error("Error in getAllFiles:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 2. GET SINGLE FILE PDF (STREAM TO BROWSER / DOWNLOAD)
exports.getFileById = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const file = await prisma.file.findFirst({
      where: {
        id,
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
    });

    if (!file) {
      return error(res, "File not found", 404);
    }

    const buffer = await storageService.getFileBuffer(file.storageKey);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.fileName)}"`);
    res.setHeader("Content-Type", file.mimeType || "application/pdf");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("Error in getFileById:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 3. GET ALL UNSIGNED FILES AWAITING SIGNATURE FOR CURRENT USER
exports.getAllUnsignedFilePerUser = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const signatureLogs = await prisma.signatureLog.findMany({
      where: {
        employeeId,
        organizationId: organizationId || undefined,
        status: "PENDING",
      },
      include: {
        file: {
          include: {
            createdBy: {
              include: { manager: true },
            },
            voucherType: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = signatureLogs
      .filter((log) => log.file && !log.file.deletedAt)
      .map((log) => ({
        FILE_ID: log.file.id,
        id: log.file.id,
        FILE_NAME: log.file.fileName,
        fileName: log.file.fileName,
        NAME: log.file.createdBy
          ? `${log.file.createdBy.firstName || ""} ${log.file.createdBy.lastName || ""}`.trim()
          : "",
        SIGNATURES_REQUIRED: log.file.voucherType?.signaturesRequired || 1,
        signaturesRequired: log.file.voucherType?.signaturesRequired || 1,
        SIGNATURES_DONE: log.file.signaturesDone,
        signaturesDone: log.file.signaturesDone,
        CREATED_ON: log.file.createdAt,
        createdAt: log.file.createdAt,
        VOUCHER_NAME: log.file.voucherType?.name || "",
        voucherName: log.file.voucherType?.name || "",
        REMARKS: log.file.remarks,
        remarks: log.file.remarks,
        MANAGER_ID: log.file.createdBy?.managerId || null,
        managerId: log.file.createdBy?.managerId || null,
      }));

    return success(res, formatted, "Unsigned files fetched successfully");
  } catch (err) {
    console.error("Error in getAllUnsignedFilePerUser:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 4. GET ALL FILES CREATED BY CURRENT USER
exports.getAllFilesCreatedByUser = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const files = await prisma.file.findMany({
      where: {
        createdById: employeeId,
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
      include: {
        voucherType: true,
        department: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = files.map((f) => ({
      FILE_ID: f.id,
      id: f.id,
      FILE_NAME: f.fileName,
      fileName: f.fileName,
      VOUCHER_NAME: f.voucherType?.name || "",
      voucherName: f.voucherType?.name || "",
      CREATED_ON: f.createdAt,
      createdAt: f.createdAt,
      REMARKS: f.remarks,
      remarks: f.remarks,
      SIGNED_BY_UPLOADER: f.signedByUploader,
      signedByUploader: f.signedByUploader,
      SIGNED_BY_ALL: f.isSignedByAll,
      isSignedByAll: f.isSignedByAll,
    }));

    return success(res, formatted, "Files created by user fetched successfully");
  } catch (err) {
    console.error("Error in getAllFilesCreatedByUser:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 5. DELETE FILE BY USER
exports.deleteFileByUser = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  const { fileId } = req.params;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
    });

    if (!file) {
      return error(res, "File not found", 404);
    }

    if (file.createdById !== employeeId && req.user?.role !== "ORG_ADMIN") {
      return error(res, "You are not authorized to delete this file", 403);
    }

    // Soft delete file
    await prisma.file.update({
      where: { id: fileId },
      data: { deletedAt: new Date() },
    });

    // Optionally delete from storage or leave for audit compliance
    try {
      await storageService.deleteFile(file.storageKey);
    } catch (e) {
      console.warn("Storage deletion warning:", e.message);
    }

    return success(res, null, "File deleted successfully");
  } catch (err) {
    console.error("Error deleting file:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 6. PIPELINE MIDDLEWARES FOR UPLOAD AND SIGNING
exports.authenticateUser = (req, res, next) => {
  req.employeeId = res.locals.id || req.user?.id;
  req.organizationId = res.locals.organizationId || req.user?.organizationId;
  next();
};

exports.validateFileUpload = (req, res, next) => {
  const { fileName, departmentId, voucherId } = req.body;
  const file = req.file;

  if (!file) {
    return error(res, "No file uploaded", 400);
  }
  if (!fileName || !departmentId || !voucherId) {
    return error(res, "Filename, Department, and Voucher Type are required", 400);
  }
  next();
};

exports.connectToDatabase = (req, res, next) => {
  // Database connection is managed automatically via PrismaClient singleton
  next();
};

// Step A: Insert without signature (Just Save)
exports.insertFileWithoutSignature = async (req, res, next) => {
  const { fileName, departmentId, remarks, fileUploadValue, voucherId } = req.body;
  const file = req.file;
  const employeeId = req.employeeId || res.locals.id;
  const organizationId = req.organizationId || res.locals.organizationId;

  if (parseInt(fileUploadValue, 10) === 1) {
    try {
      const storageKey = `files/${organizationId}/${Date.now()}_${fileName}.pdf`;
      const uploaded = await storageService.uploadFile({
        storageKey,
        buffer: file.buffer,
        mimeType: file.mimetype || "application/pdf",
      });

      const newFile = await prisma.file.create({
        data: {
          organizationId,
          fileName,
          storageKey: uploaded.storageKey,
          fileUrl: uploaded.fileUrl,
          fileSizeBytes: uploaded.sizeBytes,
          mimeType: file.mimetype || "application/pdf",
          departmentId,
          voucherTypeId: voucherId,
          createdById: employeeId,
          remarks: remarks || null,
          signedByUploader: false,
          signaturesDone: 0,
          isSignedByAll: false,
        },
      });

      return success(res, formatFile(newFile), "File just saved successfully");
    } catch (err) {
      console.error("Error inserting file without signature:", err);
      return error(res, "Failed to save file", 500);
    }
  }
  next();
};

// Step B: Fetch user's digital signature
exports.fetchDigitalSignature = async (req, res, next) => {
  const employeeId = req.employeeId || res.locals.id;
  try {
    const signature = await prisma.digitalSignature.findUnique({
      where: { employeeId },
    });

    if (!signature) {
      return error(res, "No digital signature found for this user. Please upload your signature first.", 404);
    }

    const buffer = await storageService.getFileBuffer(signature.storageKey);
    req.digitalSignature = buffer;
    next();
  } catch (err) {
    console.error("Error fetching digital signature:", err);
    return error(res, "Failed to fetch digital signature", 500);
  }
};

// Step C: Fetch signatures required
exports.getSignaturesRequired = async (req, res, next) => {
  const { voucherId } = req.body;
  try {
    const voucher = await prisma.voucherType.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) {
      return error(res, "Voucher type not found", 404);
    }

    req.signaturesRequired = voucher.signaturesRequired;
    next();
  } catch (err) {
    console.error("Error getting signatures required:", err);
    return error(res, "Failed to get voucher requirements", 500);
  }
};

// Step D: Stamp digital signature onto PDF
exports.addDigitalSignature = async (req, res, next) => {
  const { digitalSignature, file, signaturesRequired } = req;
  try {
    const pdfDoc = await PDFDocument.load(file.buffer);
    const pngImage = await pdfDoc.embedPng(digitalSignature);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const pageWidth = lastPage.getWidth();

    const desiredWidth = 100;
    const desiredHeight = 50;
    const margin = 50;
    const sigCount = signaturesRequired || 1;
    const gapBetweenSignatures =
      sigCount > 1
        ? (pageWidth - 2 * margin - desiredWidth * sigCount) / (sigCount - 1)
        : 0;

    const signaturesDone = 0;
    const positionX = margin + desiredWidth * signaturesDone + gapBetweenSignatures * signaturesDone;

    lastPage.drawImage(pngImage, {
      x: positionX,
      y: margin,
      width: desiredWidth,
      height: desiredHeight,
    });

    const updatedPdfBytes = await pdfDoc.save();
    req.updatedPdfBuffer = Buffer.from(updatedPdfBytes);
    next();
  } catch (err) {
    console.error("Error stamping digital signature:", err);
    return error(res, "Failed to process PDF signature", 500);
  }
};

// Step E: Insert file with signature
exports.insertFileWithSignature = async (req, res, next) => {
  const { fileName, departmentId, remarks, voucherId } = req.body;
  const { updatedPdfBuffer, employeeId, organizationId } = req;

  try {
    const storageKey = `files/${organizationId}/${Date.now()}_${fileName}.pdf`;
    const uploaded = await storageService.uploadFile({
      storageKey,
      buffer: updatedPdfBuffer,
      mimeType: "application/pdf",
    });

    const newFile = await prisma.file.create({
      data: {
        organizationId,
        fileName,
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.fileUrl,
        fileSizeBytes: uploaded.sizeBytes,
        mimeType: "application/pdf",
        departmentId,
        voucherTypeId: voucherId,
        createdById: employeeId,
        remarks: remarks || null,
        signedByUploader: true,
        signaturesDone: 1,
        isSignedByAll: false,
      },
    });

    req.fileId = newFile.id;
    req.createdFile = newFile;

    // Log the uploader's signature
    await prisma.signatureLog.create({
      data: {
        organizationId,
        fileId: newFile.id,
        employeeId,
        stepOrder: 1,
        status: "SIGNED",
        signedAt: new Date(),
      },
    });

    next();
  } catch (err) {
    console.error("Error inserting signed file:", err);
    return error(res, "Failed to save signed file", 500);
  }
};

// Step F: Forward for approval to next recipient
exports.forwardForApproval = async (req, res) => {
  const { fileId, organizationId, signaturesRequired, body } = req;
  const { fileUploadValue, sendFileTo } = body;

  try {
    // If only 1 signature was required, document is already complete!
    if (signaturesRequired === 1) {
      await prisma.file.update({
        where: { id: fileId },
        data: {
          isSignedByAll: true,
          status: "COMPLETED",
        },
      });
      return success(res, { fileId, status: "COMPLETED" }, "File approved and completed");
    }

    // If forwarded to next person (e.g. manager)
    if (parseInt(fileUploadValue, 10) === 3 && sendFileTo) {
      await prisma.signatureLog.upsert({
        where: {
          fileId_stepOrder_employeeId: {
            fileId,
            stepOrder: 2,
            employeeId: sendFileTo,
          },
        },
        create: {
          organizationId,
          fileId,
          stepOrder: 2,
          employeeId: sendFileTo,
          status: "PENDING",
        },
        update: {
          status: "PENDING",
        },
      });

      return success(res, { fileId, sendFileTo }, "File forwarded for approval successfully");
    }

    return success(res, { fileId }, "File uploaded and signed successfully");
  } catch (err) {
    console.error("Error in forwardForApproval:", err);
    return error(res, "Failed to forward file", 500);
  }
};

// 7. GET EXISTING PDF FOR EDITING / SIGNING
exports.getPdf = async (req, res, next) => {
  const { id } = req.params;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const file = await prisma.file.findFirst({
      where: {
        id,
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
    });

    if (!file) {
      return error(res, "File not found", 404);
    }

    const buffer = await storageService.getFileBuffer(file.storageKey);
    req.existingPdfBytes = buffer;
    req.fileRecord = file;
    req.voucherId = file.voucherTypeId;
    next();
  } catch (err) {
    console.error("Error in getPdf:", err);
    return error(res, "Failed to fetch existing PDF", 500);
  }
};

// 8. GET SIGNATURES REQUIRED FOR EDITING
exports.getSignaturesRequiredForEditing = async (req, res, next) => {
  const file = req.fileRecord;
  try {
    const voucher = await prisma.voucherType.findUnique({
      where: { id: file.voucherTypeId },
    });

    if (!voucher) {
      return error(res, "Voucher type not found", 404);
    }

    req.signaturesRequired = voucher.signaturesRequired;
    next();
  } catch (err) {
    console.error("Error in getSignaturesRequiredForEditing:", err);
    return error(res, "Failed to get voucher requirements", 500);
  }
};

// 9. STAMP SIGNATURE FOR SUBSEQUENT SIGNERS
exports.editToAddDigitalSignature = async (req, res, next) => {
  const { existingPdfBytes, digitalSignature, signaturesRequired, fileRecord } = req;

  try {
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pngImage = await pdfDoc.embedPng(digitalSignature);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const pageWidth = lastPage.getWidth();

    const desiredWidth = 100;
    const desiredHeight = 50;
    const margin = 50;
    const sigCount = signaturesRequired || 1;
    const gapBetweenSignatures =
      sigCount > 1
        ? (pageWidth - 2 * margin - desiredWidth * sigCount) / (sigCount - 1)
        : 0;

    const signaturesDone = fileRecord.signaturesDone || 0;
    const positionX = margin + desiredWidth * signaturesDone + gapBetweenSignatures * signaturesDone;

    lastPage.drawImage(pngImage, {
      x: positionX,
      y: margin,
      width: desiredWidth,
      height: desiredHeight,
    });

    const updatedPdfBytes = await pdfDoc.save();
    req.updatedPdfBuffer = Buffer.from(updatedPdfBytes);
    next();
  } catch (err) {
    console.error("Error in editToAddDigitalSignature:", err);
    return error(res, "Failed to stamp digital signature", 500);
  }
};

// 10. UPDATE PDF AND SIGNATURE LOG AFTER SIGNING
exports.updateThePdf = async (req, res, next) => {
  const { id } = req.params;
  const { employeeId, organizationId, updatedPdfBuffer, fileRecord, signaturesRequired } = req;
  const { sendTo } = req.body;

  try {
    // 1. Save updated PDF back to storage
    await storageService.uploadFile({
      storageKey: fileRecord.storageKey,
      buffer: updatedPdfBuffer,
      mimeType: "application/pdf",
    });

    const nextSignaturesDone = fileRecord.signaturesDone + 1;
    const isSignedByAll = nextSignaturesDone >= signaturesRequired;

    // 2. Update File record
    await prisma.file.update({
      where: { id },
      data: {
        signaturesDone: nextSignaturesDone,
        isSignedByAll,
        status: isSignedByAll ? "COMPLETED" : "IN_PROGRESS",
      },
    });

    // 3. Mark SignatureLog as signed
    await prisma.signatureLog.updateMany({
      where: {
        fileId: id,
        employeeId,
      },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
      },
    });

    // 4. If not completed and sendTo specified, forward to next signer
    if (!isSignedByAll && sendTo) {
      req.sendTo = sendTo;
      return next();
    }

    return success(res, { id, isSignedByAll }, "Digital signature applied and PDF updated successfully");
  } catch (err) {
    console.error("Error in updateThePdf:", err);
    return error(res, "Failed to update PDF", 500);
  }
};

// 11. JUST SIGN UPDATE (STANDALONE SIGNING)
exports.justSignUpadte = async (req, res) => {
  const { id } = req.params;
  const { employeeId, updatedPdfBuffer, fileRecord, signaturesRequired } = req;

  try {
    await storageService.uploadFile({
      storageKey: fileRecord.storageKey,
      buffer: updatedPdfBuffer,
      mimeType: "application/pdf",
    });

    const nextSignaturesDone = fileRecord.signaturesDone + 1;
    const isSignedByAll = nextSignaturesDone >= (signaturesRequired || 1);

    await prisma.file.update({
      where: { id },
      data: {
        signaturesDone: nextSignaturesDone,
        isSignedByAll,
        status: isSignedByAll ? "COMPLETED" : "IN_PROGRESS",
      },
    });

    await prisma.signatureLog.updateMany({
      where: {
        fileId: id,
        employeeId,
      },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
      },
    });

    return success(res, { id, isSignedByAll }, "Digital signature added and PDF updated successfully");
  } catch (err) {
    console.error("Error in justSignUpadte:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 12. DECLINE / REJECT A FILE
exports.declineFile = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const employeeId = res.locals.id || req.employeeId;

  try {
    await prisma.signatureLog.updateMany({
      where: {
        fileId: id,
        employeeId,
      },
      data: {
        status: "REJECTED",
        signedAt: new Date(),
        remarks: remarks || "Declined by signer",
      },
    });

    await prisma.file.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
    });

    return success(res, null, "File declined successfully");
  } catch (err) {
    console.error("Error in declineFile:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 13. APPROVED FILES PER USER
exports.approvedFilesPerUser = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const files = await prisma.file.findMany({
      where: {
        createdById: employeeId,
        organizationId: organizationId || undefined,
        isSignedByAll: true,
        deletedAt: null,
      },
      include: { voucherType: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = files.map((f) => ({
      FILE_ID: f.id,
      id: f.id,
      FILE_NAME: f.fileName,
      fileName: f.fileName,
      CREATED_ON: f.createdAt,
      createdAt: f.createdAt,
      REMARKS: f.remarks,
      remarks: f.remarks,
      VOUCHER_NAME: f.voucherType?.name || "",
      voucherName: f.voucherType?.name || "",
    }));

    return success(res, formatted, "Approved files fetched");
  } catch (err) {
    console.error("Error in approvedFilesPerUser:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 14. DECLINED FILES PER USER
exports.declinedFilesPerUser = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const declinedLogs = await prisma.signatureLog.findMany({
      where: {
        status: "REJECTED",
        organizationId: organizationId || undefined,
        file: {
          createdById: employeeId,
          deletedAt: null,
        },
      },
      include: {
        file: {
          include: { voucherType: true },
        },
        employee: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = declinedLogs.map((log) => ({
      FILE_ID: log.file.id,
      id: log.file.id,
      FILE_NAME: log.file.fileName,
      fileName: log.file.fileName,
      CREATED_BY: log.file.createdById,
      createdById: log.file.createdById,
      REMARKS: log.remarks || "",
      remarks: log.remarks || "",
      PERSON_WHO_DECLINED: log.employee
        ? `${log.employee.firstName || ""} ${log.employee.lastName || ""}`.trim()
        : "",
      VOUCHER_NAME: log.file.voucherType?.name || "",
      voucherName: log.file.voucherType?.name || "",
      CREATED_ON: log.createdAt,
      createdAt: log.createdAt,
    }));

    return success(res, formatted, "Declined files fetched");
  } catch (err) {
    console.error("Error in declinedFilesPerUser:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 15. UNSIGNED SAVED FILES PER USER
exports.unsignedSavedFilesPerUser = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const files = await prisma.file.findMany({
      where: {
        createdById: employeeId,
        organizationId: organizationId || undefined,
        deletedAt: null,
        isSignedByAll: false,
        signatureLogs: {
          none: {
            stepOrder: { gte: 2 },
          },
        },
      },
      include: { voucherType: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = files.map((f) => ({
      FILE_ID: f.id,
      id: f.id,
      FILE_NAME: f.fileName,
      fileName: f.fileName,
      CREATED_ON: f.createdAt,
      createdAt: f.createdAt,
      SIGNED_BY_UPLOADER: f.signedByUploader,
      signedByUploader: f.signedByUploader,
      REMARKS: f.remarks,
      remarks: f.remarks,
      VOUCHER_NAME: f.voucherType?.name || "",
      voucherName: f.voucherType?.name || "",
    }));

    return success(res, formatted, "Unsigned saved files fetched");
  } catch (err) {
    console.error("Error in unsignedSavedFilesPerUser:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 16. ALL SAVED FILES PER USER
exports.getAllSavedFilesPerUser = exports.unsignedSavedFilesPerUser;

// 17. GET FILES FILTERED WITH PAGINATION
exports.getFiles = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  const { department_id, start_date, end_date, page, pageSize, created_by } = req.query;

  if (!department_id) {
    return error(res, "Invalid department ID", 400);
  }

  const validPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
  const validPageSize = parseInt(pageSize, 10) > 0 ? parseInt(pageSize, 10) : 10;
  const skip = (validPage - 1) * validPageSize;

  const where = {
    organizationId: organizationId || undefined,
    departmentId: department_id,
    isSignedByAll: true,
    deletedAt: null,
  };

  if (start_date || end_date) {
    where.createdAt = {};
    if (start_date) where.createdAt.gte = new Date(start_date);
    if (end_date) where.createdAt.lte = new Date(end_date);
  }

  if (created_by) {
    where.createdById = created_by;
  }

  try {
    const [totalCount, files] = await Promise.all([
      prisma.file.count({ where }),
      prisma.file.findMany({
        where,
        include: { createdBy: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: validPageSize,
      }),
    ]);

    const formatted = files.map((f) => ({
      FILE_ID: f.id,
      id: f.id,
      FILE_NAME: f.fileName,
      fileName: f.fileName,
      CREATED_ON: f.createdAt,
      createdAt: f.createdAt,
      REMARKS: f.remarks,
      remarks: f.remarks,
      NAME: f.createdBy
        ? `${f.createdBy.firstName || ""} ${f.createdBy.lastName || ""}`.trim()
        : "",
      name: f.createdBy
        ? `${f.createdBy.firstName || ""} ${f.createdBy.lastName || ""}`.trim()
        : "",
    }));

    return res.status(200).json({
      success: true,
      totalCount,
      data: formatted,
      recordset: formatted,
      recordsets: [formatted],
    });
  } catch (err) {
    console.error("Error in getFiles:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// 18. SEND FILE TO RECIPIENT
exports.sendFileTo = async (req, res) => {
  const { id } = req.params;
  const { sendTo } = req.body;
  const organizationId = req.organizationId || res.locals.organizationId;

  if (!sendTo) {
    return error(res, "Recipient ID (sendTo) is required", 400);
  }

  try {
    // Determine the next step order
    const existingLogs = await prisma.signatureLog.count({
      where: { fileId: id },
    });
    const nextStep = existingLogs + 1;

    await prisma.signatureLog.upsert({
      where: {
        fileId_stepOrder_employeeId: {
          fileId: id,
          stepOrder: nextStep,
          employeeId: sendTo,
        },
      },
      create: {
        organizationId,
        fileId: id,
        stepOrder: nextStep,
        employeeId: sendTo,
        status: "PENDING",
      },
      update: {
        status: "PENDING",
      },
    });

    return success(res, { fileId: id, sendTo }, "File sent successfully to recipient");
  } catch (err) {
    console.error("Error in sendFileTo:", err);
    return error(res, "Internal Server Error", 500);
  }
};

exports.sendingFile = exports.sendFileTo;

// 19. GET SENT FILES WITH NEXT SIGNER STATUS
exports.getSentFiles = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    // Find all files where the user signed
    const mySignedLogs = await prisma.signatureLog.findMany({
      where: {
        employeeId,
        status: "SIGNED",
        organizationId: organizationId || undefined,
      },
      include: {
        file: {
          include: {
            signatureLogs: {
              where: {
                employeeId: { not: employeeId },
              },
              include: { employee: true },
              orderBy: { stepOrder: "asc" },
            },
          },
        },
      },
    });

    const formatted = [];
    mySignedLogs.forEach((log) => {
      if (!log.file || log.file.deletedAt) return;
      // Get the next signer in the ladder
      const nextLog = log.file.signatureLogs[0];
      if (nextLog) {
        formatted.push({
          FILE_ID: log.file.id,
          id: log.file.id,
          FILE_NAME: log.file.fileName,
          fileName: log.file.fileName,
          EMPLOYEE_ID: nextLog.employeeId,
          employeeId: nextLog.employeeId,
          EMPLOYEE_NAME: nextLog.employee
            ? `${nextLog.employee.firstName || ""} ${nextLog.employee.lastName || ""}`.trim()
            : "Colleague",
          NextUserTime: nextLog.signedAt || nextLog.createdAt,
          NextUserStatus: nextLog.status === "PENDING" ? 0 : nextLog.status === "SIGNED" ? 1 : 2,
          NextUserStatusText:
            nextLog.status === "PENDING"
              ? "In Progress"
              : nextLog.status === "SIGNED"
              ? "Approved"
              : "Declined",
        });
      }
    });

    return success(res, formatted, "Sent files tracked successfully");
  } catch (err) {
    console.error("Error in getSentFiles:", err);
    return error(res, "Internal Server Error", 500);
  }
};
