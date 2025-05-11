const { sql } = require("../config/dbConfig");

//GET DIGITAL SIGNATURE
exports.getDigitalSignature = async (req, res, next) => {
  const userId = res.locals.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized - User Id not found" });
  }
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("CREATED_BY", sql.Int, userId)
      .query(
        `SELECT FILE_DATA FROM tblDigitalSignature WHERE CREATED_BY = @CREATED_BY`
      );
    // if (result.recordedset.length === 0) {
    //   return res.status(404).json({ message: "No digital signature found" });
    // }
    const file = result.recordset[0].FILE_DATA;
    res.status(200).send(file);
  } catch (error) {
    console.log("Error in retrieving digital signature: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//POST DIGITAL SIGNATURE
exports.addDigitalSignature = async (req, res, next) => {
  const userId = res.locals.id;
  const { fileName } = req.body;
  const file = req.file;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized - User Id not found" });
  }
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("SIGNATURE_FILE_NAME", sql.NVarChar, fileName)
      .input("FILE_DATA", sql.VarBinary, file.buffer)
      .input("CREATED_BY", sql.Int, userId)
      .query(
        `INSERT INTO tblDigitalSignature (SIGNATURE_FILE_NAME,FILE_DATA, CREATED_BY) VALUES (@SIGNATURE_FILE_NAME,@FILE_DATA, @CREATED_BY)`
      );
    res.status(201).json({ message: "Digital signature added successfully" });
  } catch (error) {
    console.log("Error in");
  }
};

// PATCH DIGITAL SIGNATURE

exports.editDigitalSignature = async (req, res, next) => {
  const userId = res.locals.id;
  const { fileName } = req.body;
  const file = req.file;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized - User Id not found" });
  }
  if (!fileName) {
    return res.status(400).json({ message: "Filename is required" });
  }
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("SIGNATURE_FILE_NAME", sql.NVarChar, fileName)
      .input("FILE_DATA", sql.VarBinary(sql.MAX), file.buffer)
      .input("CREATED_BY", sql.Int, userId)
      .query(
        `UPDATE tblDigitalSignature SET SIGNATURE_FILE_NAME=@SIGNATURE_FILE_
        , FILE_DATA=@FILE_DATA, UPDATED_BY=@UPDATED_BY WHERE CREATED_BY=@CREATED_BY`
      );
  } catch (error) {
    console.log("Error in updating digital signature: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
