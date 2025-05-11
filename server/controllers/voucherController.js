const { sql } = require("../config/dbConfig");

//GET ALL VOUCHERS
exports.getAllVoucher = async (req, res, next) => {
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .query(
        "SELECT VOUCHER_ID,VOUCHER_NAME,SIGNATURES_REQUIRED FROM tblVoucherType ORDER BY VOUCHER_NAME"
      );
    res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: "Internal server error" });
  }
};

exports.getVoucherById = async (req, res, next) => {
  const { id } = req.params;
  // console.log("id: ", id);
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("VOUCHER_ID", sql.Int, id)
      .query(
        "SELECT VOUCHER_ID,VOUCHER_NAME, SIGNATURES_REQUIRED FROM tblVoucherType WHERE VOUCHER_ID = @VOUCHER_ID"
      );
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    //CONSOLE THE ERROR
    console.log("Error in getting voucher by id: ", error);
    return res.status(400).json({ error: "Internal server error" });
  }
};

//CREATE NEW VOUCHER

exports.createNewVoucher = async (req, res, next) => {
  const { voucherName, signaturesRequired } = req.body;
  if (!voucherName) {
    return res.status(400).json({ message: "Voucher name is required" });
  }
  try {
    const pool = await sql.connect();
    const checkResult = await pool
      .request()
      .input("VOUCHER_NAME", sql.NVarChar, voucherName)
      .query(
        `SELECT COUNT(*) AS COUNT FROM tblVoucherType WHERE VOUCHER_NAME = @VOUCHER_NAME`
      );
    if (checkResult.recordset[0].COUNT > 0) {
      return res.status(400).json({ message: "Voucher name already exists" });
    }
    await pool
      .request()
      .input("VOUCHER_NAME", sql.NVarChar, voucherName)
      .input("SIGNATURES_REQUIRED", sql.Int, signaturesRequired || 2)
      .query(
        `INSERT INTO tblVoucherType(VOUCHER_NAME,SIGNATURES_REQUIRED) VALUES(@VOUCHER_NAME,@SIGNATURES_REQUIRED) `
      );
    return res.status(200).json({ message: "Voucher added!!" });
  } catch (error) {
    return res.status(400).json({ error: "Internal server error" });
  }
};

//DELETE A VOUCHER

exports.deleteVoucher = async (req, res, next) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("VOUCHER_ID", sql.Int, id)
      .query("DELETE FROM tblVoucherType WHERE VOUCHER_ID = @VOUCHER_ID");
    if (!result) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (error) {
    console.log("Error in deleting voucher: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//UPDATE A VOUCHER

exports.updateVoucher = async (req, res, next) => {
  const { id } = req.params;
  const { voucherName, signaturesRequired } = req.body;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("VOUCHER_ID", sql.Int, id)
      .input("VOUCHER_NAME", sql.NVarChar, voucherName)
      .input("SIGNATURES_REQUIRED", sql.Int, signaturesRequired)
      .query(
        `UPDATE tblVoucherType 
        SET VOUCHER_NAME = @VOUCHER_NAME, 
        SIGNATURES_REQUIRED = @SIGNATURES_REQUIRED 
        WHERE VOUCHER_ID = @VOUCHER_ID`
      );
    if (!result) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    res.status(200).json({ message: "Voucher updated successfully" });
  } catch (error) {
    console.log("Error in updating voucher: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
