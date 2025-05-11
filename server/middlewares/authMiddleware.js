const jwt = require("jsonwebtoken");
const { sql } = require("../config/dbConfig");

exports.protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token expired, authorization denied" });
      }
      return res
        .status(401)
        .json({ message: "Invalid token, authorization denied" });
    }

    res.locals.id = decoded.id;
    next();
  });
};

exports.isAdmin = async (req, res, next) => {
  const { id: employeeId } = res.locals;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(
        "SELECT IS_ADMIN FROM tblEmployee WHERE EMPLOYEE_ID = @EMPLOYEE_ID"
      );

    if (!result.recordset.length || result.recordset[0].IS_ADMIN === false) {
      return res
        .status(403)
        .json({ message: "Unauthorized - You are not an admin" });
    }
    req.employeeId = employeeId;
    next();
  } catch (error) {
    console.log("Error in checking the admin: ", error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};
