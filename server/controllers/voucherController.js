const prisma = require("../config/prisma");
const { success, error } = require("../utils/response");

// Helper to format voucher object
const formatVoucher = (v) => ({
  id: v.id,
  VOUCHER_ID: v.id,
  voucherId: v.id,
  name: v.name,
  VOUCHER_NAME: v.name,
  voucherName: v.name,
  signaturesRequired: v.signaturesRequired,
  SIGNATURES_REQUIRED: v.signaturesRequired,
});

// GET ALL VOUCHERS FOR ORGANIZATION
exports.getAllVoucher = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  try {
    const vouchers = await prisma.voucherType.findMany({
      where: {
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
    });

    return success(res, vouchers.map(formatVoucher), "Vouchers fetched successfully");
  } catch (err) {
    console.error("Error in getAllVoucher:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// GET VOUCHER BY ID
exports.getVoucherById = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const voucher = await prisma.voucherType.findFirst({
      where: {
        id,
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
    });

    if (!voucher) {
      return error(res, "Voucher not found", 404);
    }

    return success(res, formatVoucher(voucher), "Voucher fetched successfully");
  } catch (err) {
    console.error("Error in getVoucherById:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// CREATE NEW VOUCHER
exports.createNewVoucher = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  const { voucherName, signaturesRequired } = req.body;

  if (!voucherName) {
    return error(res, "Voucher name is required", 400);
  }

  try {
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      const defaultOrg = await prisma.organization.findFirst();
      targetOrgId = defaultOrg?.id;
    }

    const newVoucher = await prisma.voucherType.create({
      data: {
        organizationId: targetOrgId,
        name: voucherName.trim(),
        signaturesRequired: parseInt(signaturesRequired, 10) || 1,
      },
    });

    return success(res, formatVoucher(newVoucher), "Voucher added successfully", 201);
  } catch (err) {
    console.error("Error in createNewVoucher:", err);
    if (err.code === "P2002") {
      return error(res, "A voucher with this name already exists", 400);
    }
    return error(res, "Internal Server Error", 500);
  }
};

// UPDATE A VOUCHER
exports.updateVoucher = async (req, res) => {
  const { id } = req.params;
  const { voucherName, signaturesRequired } = req.body;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const updated = await prisma.voucherType.updateMany({
      where: {
        id,
        organizationId: organizationId || undefined,
      },
      data: {
        name: voucherName ? voucherName.trim() : undefined,
        signaturesRequired:
          signaturesRequired !== undefined
            ? parseInt(signaturesRequired, 10)
            : undefined,
      },
    });

    if (updated.count === 0) {
      return error(res, "Voucher not found", 404);
    }

    return success(res, null, "Voucher updated successfully");
  } catch (err) {
    console.error("Error in updateVoucher:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// DELETE A VOUCHER
exports.deleteVoucher = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const fileCount = await prisma.file.count({
      where: {
        voucherTypeId: id,
        deletedAt: null,
      },
    });

    if (fileCount > 0) {
      return error(
        res,
        `Cannot delete voucher: ${fileCount} active file(s) are associated with this voucher type.`,
        400
      );
    }

    const deleted = await prisma.voucherType.deleteMany({
      where: {
        id,
        organizationId: organizationId || undefined,
      },
    });

    if (deleted.count === 0) {
      return error(res, "Voucher not found", 404);
    }

    return success(res, null, "Voucher deleted successfully");
  } catch (err) {
    console.error("Error in deleteVoucher:", err);
    return error(res, "Internal Server Error", 500);
  }
};
