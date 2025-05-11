const { sql } = require("../config/dbConfig");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//GET A USER
exports.getUser = async (req, res, next) => {
  const userId = res.locals.id;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, userId)
      .query(
        `SELECT EMPLOYEE_ID,FIRST_NAME, EMAIL, IS_ADMIN,DEPARTMENT_ID,MANAGER_ID FROM tblEmployee WHERE EMPLOYEE_ID = @EMPLOYEE_ID`
      );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET ALL EMPLOYEE NAME
exports.getAllUsers = async (req, res, next) => {
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .query(
        `SELECT EMPLOYEE_ID, FIRST_NAME + ' ' +LAST_NAME AS NAME FROM tblEmployee`
      );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//REGISTER A USER
exports.registerUser = async (req, res, next) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    password,
    gender,
    address,
    managerId,
    departmentId,
    isAdmin,
  } = req.body;
  if (!firstName || !lastName || !email || !password || !gender) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const pool = await sql.connect();

    const checkUserExist = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`SELECT EMPLOYEE_ID FROM tblEmployee WHERE EMAIL = @EMAIL`);
    if (checkUserExist.recordset && checkUserExist.recordset.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool
      .request()
      .input("FIRST_NAME", sql.NVARCHAR, firstName)
      .input("MIDDLE_NAME", sql.NVARCHAR, middleName)
      .input("LAST_NAME", sql.NVARCHAR, lastName)
      .input("EMAIL", sql.NVARCHAR, email)
      .input("PASSWORD", sql.NVARCHAR, hashedPassword)
      .input("GENDER", sql.NVARCHAR, gender)
      .input("ADDRESS", sql.NVARCHAR, address || null)
      //if managerid = 0, the send null
      .input("MANAGER_ID", sql.Int, managerId === 0 ? null : managerId)
      .input("DEPARTMENT_ID", sql.Int, departmentId || null)
      //if isAdmin = false, the send 0

      .input("IS_ADMIN", sql.Bit, isAdmin === false ? 0 : 1)
      .query(
        `INSERT INTO tblEmployee(FIRST_NAME,MIDDLE_NAME, LAST_NAME, EMAIL,PASSWORD, GENDER, ADDRESS, MANAGER_ID, DEPARTMENT_ID,IS_ADMIN) VALUES(@FIRST_NAME,@MIDDLE_NAME,@LAST_NAME,@EMAIL,@PASSWORD,@GENDER, @ADDRESS,@MANAGER_ID,@DEPARTMENT_ID,@IS_ADMIN)`
      );
    res.status(200).json({ message: "User registered sucessfully" });
  } catch (error) {
    console.log("Registration failed", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//LOGIN A USER
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("EMAIL", sql.NVARCHAR, email)
      .query(
        `SELECT EMPLOYEE_ID, EMAIL, PASSWORD FROM tblEmployee WHERE EMAIL = @EMAIL`
      );
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.recordset[0];
    // console.log(user);
    const match = await bcrypt.compare(password, user.PASSWORD);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.EMPLOYEE_ID }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      maxAge: 604800000,
      sameSite: true,
      secure: true,
    });
    res.status(200).json({ token });
  } catch (error) {
    console.log("Login falied", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//  FORGOT PASSWORD
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const pool = await sql.connect();
    const findUserQuery = `SELECT EMPLOYEE_ID FROM tblEmployee WHERE EMAIL = @EMAIL`;
    const userResult = await pool
      .request()
      .input("EMAIL", sql.NVarChar, email)
      .query(findUserQuery);
    if (!userResult.recordset || userResult.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const employeeId = userResult.recordset[0].EMPLOYEE_ID;
    const resetToken = jwt.sign({ id: employeeId }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    // const url = `${process.env.CLIENT_URL}/reset-password/${token}`;

    return res.status(200).json({ resetToken });
  } catch (error) {
    console.log("Forgot password failed", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//RESET THE PASSWOORD
exports.resetPassword = async (req, res, next) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  if (!password || !resetToken) {
    return res.status(400).json({ error: "Password and token are required" });
  }

  try {
    const decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decodedToken || decodedToken.id === null) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const pool = await sql.connect();
    await pool
      .request()
      .input("PASSWORD", sql.NVARCHAR, hashedPassword)
      .input("EMPLOYEE_ID", sql.Int, decodedToken.id)
      .query(
        `UPDATE tblEmployee SET PASSWORD = @PASSWORD WHERE EMPLOYEE_ID = @EMPLOYEE_ID`
      );
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET AN EMPLOYEE'S PROFILE

exports.getEmployeeProfile = async (req, res, next) => {
  const employeeId = res.locals.id;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(
        `SELECT 
        e.FIRST_NAME, 
        e.LAST_NAME,
        e.EMAIL,
        e.GENDER,
        e.ADDRESS,
        d.DEPARTMENT_NAME,
        CONCAT(m.FIRST_NAME,  ' ' ,m.LAST_NAME) AS MANAGER_NAME 
        FROM tblEmployee e 
        INNER JOIN tblDepartment d 
        ON e.DEPARTMENT_ID = d.DEPARTMENT_ID 
        LEFT JOIN tblEmployee m 
        ON e.MANAGER_ID = m.EMPLOYEE_ID 
        WHERE e.EMPLOYEE_ID = @EMPLOYEE_ID`
      );
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log("Get profile failed", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res, next) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`SELECT e.EMPLOYEE_ID,
        e.FIRST_NAME + ' ' + e.LAST_NAME AS NAME,
        d.DEPARTMENT_NAME,
        m.FIRST_NAME +' '+ m.LAST_NAME AS MANAGER_NAME 
        FROM tblEmployee e
        JOIN tblDepartment d ON e.DEPARTMENT_ID = d.DEPARTMENT_ID
        LEFT JOIN tblEmployee m ON e.MANAGER_ID = m.EMPLOYEE_ID
        `);
    res.status(200).json(result);
  } catch (error) {
    console.log("Get all employees failed", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//DELETE AN EMPLOYEE
exports.deleteEmployee = async (req, res, next) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, id)
      .query(`DELETE FROM tblEmployee WHERE EMPLOYEE_ID = @EMPLOYEE_ID`);
    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.log("Delete employee failed", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
