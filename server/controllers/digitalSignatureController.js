const prisma = require("../config/prisma");
const storageService = require("../services/storageService");
const { success, error } = require("../utils/response");

// GET CURRENT USER'S DIGITAL SIGNATURE IMAGE
exports.getDigitalSignature = async (req, res) => {
  const userId = res.locals.id || req.employeeId;

  if (!userId) {
    return error(res, "Unauthorized - User ID not found", 401);
  }

  try {
    const signature = await prisma.digitalSignature.findUnique({
      where: { employeeId: userId },
    });

    if (!signature) {
      return res.status(404).json({
        success: false,
        message: "No digital signature found for this user",
      });
    }

    const buffer = await storageService.getFileBuffer(signature.storageKey);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `inline; filename="${signature.fileName}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("Error retrieving digital signature:", err);
    return error(res, "Failed to retrieve digital signature", 500);
  }
};

// ADD DIGITAL SIGNATURE
exports.addDigitalSignature = async (req, res) => {
  const userId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;
  const file = req.file;
  const fileName = req.body.fileName || file?.originalname || "signature.png";

  if (!userId) {
    return error(res, "Unauthorized - User ID not found", 401);
  }

  if (!file || !file.buffer) {
    return error(res, "No signature file uploaded", 400);
  }

  try {
    const ext = file.mimetype === "image/jpeg" ? "jpg" : "png";
    const storageKey = `signatures/${organizationId}/${userId}.${ext}`;

    const uploaded = await storageService.uploadFile({
      storageKey,
      buffer: file.buffer,
      mimeType: file.mimetype || "image/png",
    });

    const signature = await prisma.digitalSignature.upsert({
      where: { employeeId: userId },
      create: {
        organizationId,
        employeeId: userId,
        fileName,
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.fileUrl,
      },
      update: {
        fileName,
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.fileUrl,
      },
    });

    return success(res, signature, "Digital signature added successfully", 201);
  } catch (err) {
    console.error("Error adding digital signature:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// EDIT DIGITAL SIGNATURE
exports.editDigitalSignature = async (req, res) => {
  const userId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;
  const file = req.file;
  const fileName = req.body.fileName || file?.originalname || "signature.png";

  if (!userId) {
    return error(res, "Unauthorized - User ID not found", 401);
  }

  if (!file || !file.buffer) {
    return error(res, "No signature file uploaded", 400);
  }

  try {
    const ext = file.mimetype === "image/jpeg" ? "jpg" : "png";
    const storageKey = `signatures/${organizationId}/${userId}.${ext}`;

    const uploaded = await storageService.uploadFile({
      storageKey,
      buffer: file.buffer,
      mimeType: file.mimetype || "image/png",
    });

    const signature = await prisma.digitalSignature.upsert({
      where: { employeeId: userId },
      create: {
        organizationId,
        employeeId: userId,
        fileName,
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.fileUrl,
      },
      update: {
        fileName,
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.fileUrl,
      },
    });

    return success(res, signature, "Digital signature updated successfully");
  } catch (err) {
    console.error("Error updating digital signature:", err);
    return error(res, "Internal Server Error", 500);
  }
};
