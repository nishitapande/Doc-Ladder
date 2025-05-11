const { sql } = require("../config/dbConfig");

exports.getUserDepartments = async (req, res) => {
  const employeeId = res.locals.id;
  try {
    const pool = await sql.connect();
    const selectQuery = `
    SELECT d.DEPARTMENT_ID, d.DEPARTMENT_NAME
    FROM tblEmployee e
    JOIN tblSecurity s
    ON e.EMPLOYEE_ID = s.EMPLOYEE_ID
    JOIN tblDepartment d
    ON s.DEPARTMENT_ID = d.DEPARTMENT_ID
    WHERE s.EMPLOYEE_ID = @EMPLOYEE_ID
    `;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(selectQuery);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
