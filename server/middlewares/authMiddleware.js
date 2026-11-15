require("../config/nodePolyfill");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { error } = require("../utils/response");

exports.protect = async (req, res, next) => {
  // Support both cookie and Authorization Bearer header
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return error(res, "No token, authorization denied", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return error(res, "Invalid token payload, authorization denied", 401);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        organizationId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        departmentId: true,
        managerId: true,
        deletedAt: true,
      },
    });

    if (!employee || employee.deletedAt) {
      return error(res, "Account not found or deactivated", 401);
    }

    // Attach contextual identifiers to req and res.locals
    req.user = employee;
    req.employeeId = employee.id;
    req.organizationId = employee.organizationId;

    res.locals.id = employee.id;
    res.locals.organizationId = employee.organizationId;
    res.locals.role = employee.role;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, "Token expired, please log in again", 401);
    }
    return error(res, "Invalid token, authorization denied", 401);
  }
};

exports.isAdmin = async (req, res, next) => {
  const employeeId = res.locals.id || req.employeeId;
  if (!employeeId) {
    return error(res, "Unauthorized - Please authenticate first", 401);
  }

  try {
    const employee = req.user || (await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { role: true, deletedAt: true },
    }));

    if (!employee || employee.deletedAt || (employee.role !== "ORG_ADMIN" && employee.role !== "SUPER_ADMIN")) {
      return error(res, "Unauthorized - You do not have admin permissions", 403);
    }

    req.employeeId = employeeId;
    next();
  } catch (err) {
    console.error("Error checking admin status:", err);
    return error(res, "Internal server error", 500);
  }
};
