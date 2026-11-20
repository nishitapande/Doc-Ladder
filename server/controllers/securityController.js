const prisma = require("../config/prisma");
const { success, error } = require("../utils/response");

// GET ALL DEPARTMENTS AN EMPLOYEE HAS ACCESS TO (Primary + Secondary Access)
exports.getUserDepartments = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    // 1. Fetch user's primary department
    const user = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true },
    });

    // 2. Fetch all explicitly granted secondary departments (tbl_employee_department_access)
    const accessRecords = await prisma.employeeDepartmentAccess.findMany({
      where: {
        employeeId,
        organizationId: organizationId || undefined,
      },
      include: {
        department: true,
      },
    });

    const departmentMap = new Map();

    // Add primary department if assigned
    if (user && user.department && !user.department.deletedAt) {
      departmentMap.set(user.department.id, {
        id: user.department.id,
        DEPARTMENT_ID: user.department.id,
        departmentId: user.department.id,
        name: user.department.name,
        DEPARTMENT_NAME: user.department.name,
        departmentName: user.department.name,
        isPrimary: true,
      });
    }

    // Add secondary departments
    accessRecords.forEach((record) => {
      if (record.department && !record.department.deletedAt) {
        departmentMap.set(record.department.id, {
          id: record.department.id,
          DEPARTMENT_ID: record.department.id,
          departmentId: record.department.id,
          name: record.department.name,
          DEPARTMENT_NAME: record.department.name,
          departmentName: record.department.name,
          isPrimary: false,
        });
      }
    });

    const result = Array.from(departmentMap.values());
    return success(res, result, "User departments fetched successfully");
  } catch (err) {
    console.error("Error in getUserDepartments:", err);
    return error(res, "Internal Server error", 500);
  }
};
