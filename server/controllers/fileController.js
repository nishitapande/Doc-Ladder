const { sql } = require("../config/dbConfig");
const { PDFDocument } = require("pdf-lib");

//GET ALL FILES
exports.getAllFiles = async (req, res, next) => {
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .query(
        `SELECT f.FILE_ID, f.FILE_NAME, f.CREATED_ON,e.FIRST_NAME + " " + e.LAST_NAME AS NAME, f.REMARKS FROM tblFile f INNER JOIN tblDepartment ON tblEmployee AS e ON f.CREATED_BY = e.EMPLOYEE_ID WHERE f.SIGNED_BY_ALL = 1`
      );
    res.status(200).json(result);
  } catch (error) {
    console.log("Error in getting   all files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET A SINGLE FILE
exports.getFileById = async (req, res, next) => {
  const { id } = req.params;
  // console.log("fileId", id);
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("ID", sql.Int, id)
      .query(`SELECT FILE_DATA,FILE_NAME FROM tblFile WHERE FILE_ID = @ID `);
    // if (result.recordset.length === 0) {
    //   return res.status(404).json({ message: "File not found" });
    // }
    const { FILE_DATA, FILE_NAME } = result.recordset[0];

    res.setHeader("Content-Disposition", `attachment;filename = ${FILE_NAME}`);
    res.contentType("Content-Type", "application/pdf");
    res.status(200).send(FILE_DATA);
  } catch (error) {
    console.log("Error in getting file by id: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET ALL UNSIGNED FILES PER USER
exports.getAllUnsignedFilePerUser = async (req, res, next) => {
  const employeeId = res.locals.id;
  try {
    const pool = await sql.connect();
    const getFilesQuery = `SELECT 
    s.FILE_ID,
    f.FILE_NAME, 
    e.FIRST_NAME + ' ' + e.LAST_NAME AS NAME,
    v.SIGNATURES_REQUIRED,
    f.SIGNATURES_DONE,
    f.CREATED_ON,
    v.VOUCHER_NAME,
    f.REMARKS 
    FROM tblSignatureLog s
    INNER JOIN tblFile f ON s.FILE_ID = f.FILE_ID
    INNER JOIN tblVoucherType v ON f.VOUCHER_ID = v.VOUCHER_ID
    INNER JOIN tblEmployee e ON f.CREATED_BY = e.EMPLOYEE_ID
    WHERE s.EMPLOYEE_ID = @EMPLOYEE_ID AND s.STATUS = 0
    ORDER BY f.CREATED_ON DESC`;

    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(getFilesQuery);

    res.status(200).json(result);
  } catch (error) {
    console.log("error in getting all unsigned files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET ALL FILES PER USER THAT ARE CREATED BY THEM
exports.getAllFilesCreatedByUser = async (req, res, next) => {
  const employeeId = res.locals.id;
  try {
    const pool = await sql.connect();
    const getFilesQuery = `SELECT 
    f.FILE_ID, 
    f.FILE_NAME ,
    v.VOUCHER_NAME, 
    f.CREATED_ON,
    f.REMARKS,
    f.SIGNED_BY_UPLOADER,
    f.SIGNED_BY_ALL 
    FROM tblFile f
    INNER JOIN tblVoucherType v 
    ON f.VOUCHER_ID = v.VOUCHER_ID
    WHERE f.CREATED_BY = @EMPLOYEE_ID
    ORDER BY f.CREATED_ON DESC`;

    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(getFilesQuery);

    if (!result) {
      return res.status(404).json({ error: "Try again later" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log("error in getting all files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//DELETE FILE BY USER
exports.deleteFileByUser = async (req, res, next) => {
  const { employeeId, pool } = req;
  const { fileId } = req.params;

  try {
    const getCreatedBy = `SELECT CREATED_BY FROM tblFile WHERE FILE_ID = @FILE_ID`;

    const getResult = await pool
      .request()
      .input("FILE_ID", sql.Int, id)
      .query(getCreatedBy);

    if (!getResult.recordset[0]) {
      return res.status(404).json({ error: "File not found" });
    }

    //extract created_by
    const createdBy = getResult.recordset[0].CREATED_BY;

    //check if createdby is equal to employeeid
    if (createdBy !== employeeId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this file" });
    }

    const deleteFileQuery = `DELETE FROM tblFile WHERE FILE_ID = @FILE_ID AND CREATED_BY = @EMPLOYEE_ID`;

    const result = await pool
      .request()
      .input("FILE_ID", sql.Int, id)
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(deleteFileQuery);

    if (!result) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.log("error in deleting file: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// AUTHENTICATED USER
exports.authenticateUser = async (req, res, next) => {
  const employeeId = res.locals.id;

  if (!employeeId) {
    return res.status(401).json({ error: "Unauthorized Access" });
  }
  req.employeeId = employeeId;
  next();
};

// FILE VALIDATION
exports.validateFileUpload = async (req, res, next) => {
  // TODO: WHY TO REASSIGN ON 509 LINE
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  if (!["pdf"].includes(file.mimetype.split("/")[1])) {
    return res
      .status(400)
      .json({ error: "Invalid file type. Only PDF are allowed" });
  }
  req.file = file;
  next();
};

// CONNECT TO DB
exports.connectToDatabase = async (req, res, next) => {
  try {
    const pool = await sql.connect();
    req.pool = pool;
    next();
  } catch (error) {
    console.log("Database connection error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//UPLOAD FILE WITHOUT SIGNATURE
exports.insertFileWithoutSignature = async (req, res, next) => {
  const { fileName, departmentId, remarks, fileUploadValue, voucherId } =
    req.body;
  const { file, pool, employeeId } = req;
  console.log("fileuploadvalue: ", fileUploadValue);

  if (fileUploadValue === 1) {
    console.log(fileUploadValue === 1 ? true : false);
    const uploadWithoutSignQuery = `INSERT INTO tblFile(FILE_NAME,FILE_DATA,CREATED_BY,DEPARTMENT_ID,VOUCHER_ID,REMARKS)
    VALUES(@FILE_NAME,@FILE_DATA,@CREATED_BY,@DEPARTMENT_ID,@VOUCHER_ID,@REMARKS)`;
    await pool
      .request()
      .input("FILE_NAME", sql.NVarChar, fileName)
      .input("FILE_DATA", sql.VarBinary(sql.MAX), file?.buffer)
      .input("CREATED_BY", sql.Int, employeeId)
      .input("DEPARTMENT_ID", sql.Int, departmentId)
      .input("VOUCHER_ID", sql.Int, voucherId)
      .input("REMARKS", sql.NVarChar, remarks)
      .query(uploadWithoutSignQuery);

    return res.status(200).json({ message: "File just saved!!" });
  }
  next();
};

//GET DIGITAL SIGNATURE
exports.fetchDigitalSignature = async (req, res, next) => {
  const { pool, employeeId } = req;
  try {
    const getDigitalSignatureQuery = `SELECT FILE_DATA FROM tblDigitalSignature WHERE CREATED_BY = @EMPLOYEE_ID`;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(getDigitalSignatureQuery);

    if (!result.recordset.length) {
      return res
        .status(404)
        .json({ error: "No digital signature found for this user" });
    }
    const digitalSignature = result.recordset[0].FILE_DATA;
    if (!Buffer.isBuffer(digitalSignature)) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    req.digitalSignature = digitalSignature;
    next();
  } catch (error) {
    console.log("error in fetching digital signature: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET SIGNATURES REQUIRED
exports.getSignaturesRequired = async (req, res, next) => {
  const { voucherId } = req.body;
  const { pool } = req;
  try {
    const getSignaturesRequiredQuery = `SELECT SIGNATURES_REQUIRED FROM tblVoucherType WHERE VOUCHER_ID = @VOUCHER_ID`;
    const result = await pool
      .request()
      .input("VOUCHER_ID", sql.Int, voucherId)
      .query(getSignaturesRequiredQuery);
    if (!result.recordset.length) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    const signaturesRequired = result.recordset[0].SIGNATURES_REQUIRED;
    req.signaturesRequired = signaturesRequired;
    next();
  } catch (error) {
    console.log("error in getting signatures required: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//PROCESS PDF
exports.addDigitalSignature = async (req, res, next) => {
  const { digitalSignature, file, signaturesRequired } = req;
  try {
    const pdfDoc = await PDFDocument.load(file.buffer);
    const pngImage = await pdfDoc.embedPng(digitalSignature);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const pageWidth = lastPage.getWidth();
    //TODO: CHECKING IF THE IMAGE DOES NOT OVERWRITE THE PDF
    const desiredWidth = 100;
    const desiredHeight = 50;
    const margin = 50;
    console.log(pageWidth);
    const gapBetweenSignatures =
      (pageWidth - 2 * margin - desiredWidth * signaturesRequired) /
      (signaturesRequired - 1);

    let signaturesDone;
    signaturesDone = 0;
    const positionX =
      margin +
      desiredWidth * signaturesDone +
      gapBetweenSignatures * (signaturesDone === 0 ? 0 : signaturesDone);

    lastPage.drawImage(pngImage, {
      x: positionX,
      y: margin,
      width: desiredWidth,
      height: desiredHeight,
    });
    const updatedPdfBytes = await pdfDoc.save();
    req.updatedPdfBuffer = Buffer.from(updatedPdfBytes);
    next();
  } catch (error) {
    console.log("error in adding digital signature: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//INSERT SIGNED FILE IN DB
exports.insertFileWithSignature = async (req, res, next) => {
  const { fileName, departmentId, remarks, voucherId } = req.body;
  const { updatedPdfBuffer, pool, employeeId } = req;

  try {
    const uQuery = `INSERT INTO tblFile (FILE_NAME,FILE_DATA,CREATED_BY,DEPARTMENT_ID,VOUCHER_ID,REMARKS,SIGNATURES_DONE,SIGNED_BY_UPLOADER) 
    OUTPUT INSERTED.FILE_ID 
    VALUES (@FILE_NAME,@FILE_DATA,@CREATED_BY,@DEPARTMENT_ID,@VOUCHER_ID,@REMARKS,@SIGNATURES_DONE,@SIGNED_BY_UPLOADER)`;

    const result = await pool
      .request()
      .input("FILE_NAME", sql.NVarChar, fileName)
      .input("FILE_DATA", sql.VarBinary(sql.MAX), updatedPdfBuffer)
      .input("CREATED_BY", sql.Int, employeeId)
      .input("DEPARTMENT_ID", sql.Int, departmentId)
      .input("VOUCHER_ID", sql.Int, voucherId)
      .input("REMARKS", sql.NVarChar, remarks)
      .input("SIGNATURES_DONE", sql.Int, 1)
      .input("SIGNED_BY_UPLOADER", sql.Bit, 1)
      .query(uQuery);

    const fileId = result.recordset[0].FILE_ID;
    req.fileId = fileId;

    const insertIntoSignatureLogQuery = `INSERT INTO tblSignatureLog(FILE_ID,EMPLOYEE_ID,TIME_STAMP,STATUS) VALUES(@FILE_ID,@EMPLOYEE_ID,@TIME_STAMP,@STATUS)`;

    await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .input("TIME_STAMP", sql.Date, new Date())
      .input("STATUS", sql.Int, 1)
      .query(insertIntoSignatureLogQuery);

    next();
  } catch (error) {
    console.log("error in inserting file with signature: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//SENDING FORWARD FOR APPROVAL
exports.forwardForApproval = async (req, res, next) => {
  const { fileId, pool, body, signaturesRequired } = req;
  const { fileUploadValue, sendFileTo } = body;
  // console.log("fileUploadValue: ", fileUploadValue);
  // console.log(typeof fileUploadValue);
  try {
    if (signaturesRequired === 1) {
      const updateTheFileQuery = `
      UPDATE tblFile
      SET SIGNED_BY_ALL = @SIGNED_BY_ALL
      WHERE FILE_ID = @FILE_ID
      `;
      const updateResult = await pool
        .request()
        .input("SIGNED_BY_ALL", sql.Bit, 1)
        .input("FILE_ID", sql.Int, fileId)
        .query(updateTheFileQuery);

      return res.status(200).json({ message: "File approved for approval" });
    }
    console.log("here 1");
    if (fileUploadValue == 3) {
      //insert into signature log
      console.log("here reached");
      const insertIntoSignatureLogQuery = `
      INSERT INTO tblSignatureLog(FILE_ID, EMPLOYEE_ID,STATUS) VALUES(@FILE_ID,@EMPLOYEE_ID,@STATUS)`;
      await pool
        .request()
        .input("FILE_ID", sql.Int, fileId)
        .input("EMPLOYEE_ID", sql.Int, sendFileTo)
        .input("STATUS", sql.Int, 0)
        .query(insertIntoSignatureLogQuery);

      console.log("hereee");

      return res.status(200).json({ message: "File forwarded for approval" });
    }
    return res
      .status(200)
      .json({ message: "File uploaded and saved successfullyg" });
  } catch (error) {
    console.log("error in forwarding for approval: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET THE EXISTING PDF
exports.getPdf = async (req, res, next) => {
  const { pool } = req;
  const { id } = req.params;
  const fileId = id;
  try {
    const getExistingPdfQuery = `SELECT FILE_DATA,VOUCHER_ID FROM tblFile WHERE FILE_ID = @FILE_ID`;
    const result = await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .query(getExistingPdfQuery);
    if (!result.recordset.length) {
      return res.status(404).json({ error: "File not found" });
    }
    const existingPdf = result.recordset[0].FILE_DATA;
    const voucherId = result.recordset[0].VOUCHER_ID;
    req.existingPdfBytes = existingPdf;
    req.voucherId = voucherId;
    next();
  } catch (error) {
    console.log("error in getting existing pdf: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//SIGNATURES REQUIRED FOR EDITING
exports.getSignaturesRequiredForEditing = async (req, res, next) => {
  const { id } = req.params;
  const fileId = id;
  const { pool } = req;
  try {
    const getSignaturesRequiredQuery = `SELECT v.SIGNATURES_REQUIRED FROM tblFile f INNER JOIN tblVoucherType v 
    ON f.VOUCHER_ID = v.VOUCHER_ID WHERE FILE_ID = @FILE_ID`;
    const result = await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .query(getSignaturesRequiredQuery);
    if (!result.recordset.length) {
      return res.status(404).json({ error: "File not found" });
    }
    const signaturesRequired = result.recordset[0].SIGNATURES_REQUIRED;
    req.signaturesRequired = signaturesRequired;
    next();
  } catch (error) {
    console.log("error in getting signatures required for editing: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//EDIT TO ADD DIGITAL SIGNATURE
exports.editToAddDigitalSignature = async (req, res, next) => {
  const { existingPdfBytes, digitalSignature, signaturesRequired, pool } = req;
  const { id } = req.params;
  const fileId = id;
  try {
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pngImage = await pdfDoc.embedPng(digitalSignature);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const pageWidth = lastPage.getWidth();
    const desiredWidth = 100;
    const desiredHeight = 50;
    const margin = 50;
    const gapBetweenSignatures =
      (pageWidth - 2 * margin - desiredWidth * signaturesRequired) /
      (signaturesRequired - 1);
    let signaturesDone = 0;

    if (fileId) {
      const signResult = await pool
        .request()
        .input("FILE_ID", sql.Int, fileId)
        .query(`SELECT SIGNATURES_DONE FROM tblFile WHERE FILE_ID = @FILE_ID`);
      if (!signResult.recordset.length) {
        return res.status(404).json({ error: "File not found" });
      }
      signaturesDone = signResult.recordset[0]?.SIGNATURES_DONE;
    } else {
      signaturesDone = 0;
    }
    const positionX =
      margin +
      desiredWidth * signaturesDone +
      gapBetweenSignatures * (signaturesDone === 0 ? 0 : signaturesDone);

    lastPage.drawImage(pngImage, {
      x: positionX,
      y: margin,
      width: desiredWidth,
      height: desiredHeight,
    });
    const updatedPdfBytes = await pdfDoc.save();
    req.updatedPdfBuffer = Buffer.from(updatedPdfBytes);
    next();
  } catch (error) {
    console.log("error in editing to add digital signature: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//UPDATE THE PDF
exports.updateThePdf = async (req, res, next) => {
  const { id } = req.params;
  const fileId = id;
  const { employeeId, updatedPdfBuffer, pool } = req;
  const { sendTo } = req.body;
  try {
    const updateThePdfQuery = `
   BEGIN TRANSACTION
   UPDATE tblFile
   SET
   FILE_DATA = @FILE_DATA,
   SIGNATURES_DONE = SIGNATURES_DONE + 1,
   SIGNED_BY_ALL = CASE
        WHEN (SIGNATURES_DONE + 1) = v.SIGNATURES_REQUIRED THEN 1
        ELSE SIGNED_BY_ALL
        END
   FROM tblFile f
   INNER JOIN tblVoucherType v
   ON f.VOUCHER_ID = v.VOUCHER_ID
   WHERE FILE_ID = @FILE_ID;

   SELECT SIGNED_BY_ALL FROM tblFile WHERE FILE_ID = @FILE_ID

   COMMIT TRANSACTION
    `;
    const result = await pool
      .request()
      .input("FILE_DATA", sql.VarBinary(sql.MAX), updatedPdfBuffer)
      .input("FILE_ID", sql.Int, fileId)
      .query(updateThePdfQuery);

    const isSignedByAll = result.recordset[0].SIGNED_BY_ALL;

    const updateSignatureLogQuery = `
    UPDATE tblSignatureLog
    SET STATUS = 1,
    TIME_STAMP = GETDATE()
    WHERE FILE_ID = @FILE_ID AND EMPLOYEE_ID = @EMPLOYEE_ID
    `;
    await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(updateSignatureLogQuery);

    if (isSignedByAll === 0 && sendTo) {
      return next();
    }
    return res.status(200).json({ message: "File updated successfully" });
  } catch (error) {
    console.log("error in updating the pdf: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//DECLINE A FILE
exports.declineFile = async (req, res, next) => {
  const { remarks } = req.body;
  const { pool, employeeId } = req;
  const { id } = req.params;
  const fileId = id;
  try {
    //TODO: FIND IF ITS THE CORRECT MANAGER!!
    const declineQuery = `
    UPDATE tblSignatureLog
    SET 
    STATUS = 2,
    TIME_STAMP = @TIME_STAMP,
    REMARKS = @REMARKS
    WHERE FILE_ID = @FILE_ID AND EMPLOYEE_ID = @EMPLOYEE_ID
    `;
    const declineResult = await pool
      .request()
      .input("TIME_STAMP", sql.Date, new Date())
      .input("REMARKS", sql.NVarChar, remarks)
      .input("FILE_ID", sql.Int, fileId)
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(declineQuery);

    return res.status(200).json({ message: "File declined for approval" });
  } catch (error) {
    console.log("error in declining file: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET ALL APPROVED FILES PER USER
exports.approvedFilesPerUser = async (req, res, next) => {
  const { employeeId, pool } = req;
  try {
    const searchQuery = ` 
    SELECT
    f.FILE_ID,
    f.FILE_NAME,
    f.CREATED_ON,
    f.REMARKS,
    v.VOUCHER_NAME
    FROM tblFile f
    INNER JOIN tblVoucherType v ON f.VOUCHER_ID = v.VOUCHER_ID
    WHERE f.SIGNED_BY_ALL = 1 AND f.CREATED_BY = @EMPLOYEE_ID
    ORDER BY
    f.CREATED_ON DESC
    `;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(searchQuery);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.log("error in fetching approved files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET ALL DECLINED FILES PER USER
exports.declinedFilesPerUser = async (req, res, next) => {
  const { employeeId, pool } = req;
  try {
    const searchQuery = `
    SELECT
    f.FILE_ID,
    f.FILE_NAME,
    f.CREATED_BY,
    sl.REMARKS,
    e.FIRST_NAME + ' ' + e.LAST_NAME AS PERSON_WHO_DECLINED,
    v.VOUCHER_NAME
    FROM tblFile f
    JOIN tblSignatureLog sl 
    ON f.FILE_ID = sl.FILE_ID
    JOIN tblEmployee e
    ON sl.EMPLOYEE_ID = e.EMPLOYEE_ID
    INNER JOIN tblVoucherType v 
    ON f.VOUCHER_ID = v.VOUCHER_ID
    WHERE sl.STATUS = 2 AND f.CREATED_BY = @EMPLOYEE_ID
    ORDER BY
    f.CREATED_ON DESC
    `;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(searchQuery);
    res.status(200).json(result);
  } catch (error) {
    console.log("error in fetching declined files: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//GET ALL UNSIGNED SAVED FILES PER USER

exports.unsignedSavedFilesPerUser = async (req, res, next) => {
  const { employeeId, pool } = req;
  try {
    const searchQuery = `
    SELECT
    f.FILE_ID,
    f.FILE_NAME,
    f.CREATED_ON,
    f.SIGNED_BY_UPLOADER,
    f.REMARKS,
    v.VOUCHER_NAME
    FROM tblFile f
    INNER JOIN tblVoucherType v 
    ON f.VOUCHER_ID = v.VOUCHER_ID
    WHERE 
    (f.SIGNED_BY_UPLOADER = 0 OR (f.SIGNED_BY_UPLOADER = 1 AND f.SIGNED_BY_ALL = 0))
    AND CREATED_BY = @EMPLOYEE_ID
    AND NOT EXISTS(
      SELECT 1
      FROM tblSignatureLog sl
      WHERE sl.FILE_ID = f.FILE_ID 
     GROUP BY sl.FILE_ID 
      HAVING COUNT(*) >= 2
    )
    ORDER BY
    f.CREATED_ON DESC
    `;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(searchQuery);
    res.status(200).json(result);
  } catch (error) {
    console.log("error in fetching unsigned saved files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET ALL SAVED FILES PER USER
exports.getAllSavedFilesPerUser = async (req, res, next) => {
  const { employeeId, pool } = req;
  try {
    const searchQuery = `
    SELECT
    f.FILE_ID,
    f.FILE_NAME,
    f.CREATED_BY,
    f.REMARKS,
    f.CREATED_ON,
    f.SIGNED_BY_UPLOADER,
    f.SIGNED_BY_ALL,
    v.VOUCHER_NAME
    FROM tblFile f
    INNER JOIN tblVoucher v ON f.VOUCHER_ID = v.VOUCHER_ID
    WHERE (f.SIGNED_BY_UPLOADER = 0 OR (f.SIGNED_BY_UPLOADER = 1 AND f.SIGNED_BY_ALL = 0))
          AND f.CREATED_BY = @EMPLOYEE_ID
          AND NOT EXITS(
          SELECT 1 FROM tblSignatureLog sl WHERE sl.FILE_ID = f.FILE_ID AND GROUP BY sl.FILE_ID HAVING COUNT(*) >=2
      )    
          ORDER BY f.CREATED_ON DESC
    `;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(searchQuery);
    return res.status(200).json(result);
  } catch (error) {
    console.log("error in fetching all saved files: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET ALL FILES PER PARAMS
exports.getFiles = async (req, res, next) => {
  const { pool } = req;
  const { department_id, start_date, end_date, page, pageSize, created_by } =
    req.query;

  // Validate department_id, page, and pageSize
  if (!department_id || isNaN(department_id) || department_id <= 0) {
    return res.status(400).json({ error: "Invalid department ID" });
  }

  const validPage = page && !isNaN(page) && page > 0 ? parseInt(page) : 1;
  const validPageSize =
    pageSize && !isNaN(pageSize) && pageSize > 0 ? parseInt(pageSize) : 10;
  const offset = (validPage - 1) * validPageSize;

  try {
    const request = pool
      .request()
      .input("DEPARTMENT_ID", sql.Int, department_id);

    let query = `
      SELECT f.FILE_ID, f.FILE_NAME, f.CREATED_ON, f.REMARKS, 
             e.FIRST_NAME + ' ' + e.LAST_NAME AS NAME, 
             COUNT(*) OVER() AS TOTAL_COUNT 
      FROM tblFile f
      INNER JOIN tblEmployee e 
      ON f.CREATED_BY = e.EMPLOYEE_ID
      WHERE f.DEPARTMENT_ID = @DEPARTMENT_ID AND f.SIGNED_BY_ALL = 1
    `;

    if (start_date) {
      query += ` AND f.CREATED_ON >= @START_DATE`;
      request.input("START_DATE", sql.Date, start_date);
    }
    if (end_date) {
      query += ` AND f.CREATED_ON <= @END_DATE`;
      request.input("END_DATE", sql.Date, end_date);
    }
    if (created_by) {
      query += ` AND f.CREATED_BY = @CREATED_BY`;
      request.input("CREATED_BY", sql.Int, created_by);
    }

    query += ` ORDER BY f.CREATED_ON DESC OFFSET @OFFSET ROWS FETCH NEXT @PAGE_SIZE ROWS ONLY`;

    request.input("OFFSET", sql.Int, offset);
    request.input("PAGE_SIZE", sql.Int, validPageSize);

    const result = await request.query(query);
    const totalCount =
      result.recordset.length > 0 ? result.recordset[0].TOTAL_COUNT : 0;

    return res.status(200).json({
      totalCount,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error in fetching all files: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//SEND FILE TO SOMEONE
exports.sendFileTo = async (req, res, next) => {
  const { id } = req.params;
  const fileId = id;
  const { pool } = req;
  const { sendTo } = req.body;
  try {
    console.log("sendTo: ", sendTo);

    const insertIntoSignatureLogQuery = `
      INSERT INTO tblSignatureLog (FILE_ID, EMPLOYEE_ID, STATUS)
      VALUES (@FILE_ID, @EMPLOYEE_ID, 0)
      `;
    const result = await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .input("EMPLOYEE_ID", sql.Int, sendTo)
      .input("STATUS", sql.Int, 0)
      .query(insertIntoSignatureLogQuery);
    return res.status(200).json({ message: "File sent to " + sendTo });
  } catch (error) {
    console.log("error in sending file to: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  return res.status(200).json({ message: "File signed!!" });
};

exports.justSignUpadte = async (req, res, next) => {
  const { id } = req.params;
  const fileId = id;
  const { pool, updatedPdfBuffer, employeeId } = req;
  try {
    const updateFileQuery = `
       BEGIN TRANSACTION
   UPDATE tblFile
   SET
   FILE_DATA = @FILE_DATA,
   SIGNATURES_DONE = SIGNATURES_DONE + 1
   SIGNED_BY_ALL = CASE
   WHEN SIGNATURES_DONE = SIGNATURES_REQUIRED THEN 1
   ELSE SIGNED_BY_ALL
   END
   FROM tblFile f
   INNER JOIN tblVoucherType v
   ON f.VOUCHER_ID = v.VOUCHER_ID
   WHERE FILE_ID = @FILE_ID

   SELECT SIGNED_BY_ALL FROM tblFile WHERE FILE_ID = @FILE_ID

   COMMIT TRANSACTION
    `;
    const result = await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .input("FILE_DATA", sql.VarBinary(sql.MAX), updatedPdfBuffer)
      .query(updateFileQuery);
    const isSignedByAll = result.recordset[1].SIGNED_BY_ALL;

    const updateSignatureLogQuery = `
    UPDATE tblSignatureLog
    SET STATUS = 1
    WHERE FILE_ID = @FILE_ID AND EMPLOYEE_ID = @EMPLOYEE_ID
    `;
    await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(updateSignatureLogQuery);

    return res.status(200).json({
      message: "Digital signature added and PDF updated successfully",
    });
  } catch (error) {
    console.log("error in just signing and updating: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.sendingFile = async (req, res, next) => {
  const { id } = req.params;
  const fileId = id;
  const { sendTo } = req.body;
  const { pool } = req;
  try {
    const insertIntoSignatureLogQuery = `
    INSERT INTO tblSignatureLog (FILE_ID, EMPLOYEE_ID, STATUS)
    VALUES (@FILE_ID, @EMPLOYEE_ID, 0)
    `;
    const result = await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .input("EMPLOYEE_ID", sql.Int, sendTo)
      .input("STATUS", sql.Int, 0)
      .query(insertIntoSignatureLogQuery);

    return res.status(200).json({ message: "File sent to " + sendTo });
  } catch (error) {
    console.log("error in sending file to: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
