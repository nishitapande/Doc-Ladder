require("../config/nodePolyfill");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { success, error } = require("../utils/response");

// Helper to format employee for backward-compatible frontend consumption
const formatEmployeeResponse = (emp) => ({
  id: emp.id,
  EMPLOYEE_ID: emp.id,
  firstName: emp.firstName,
  FIRST_NAME: emp.firstName,
  middleName: emp.middleName,
  MIDDLE_NAME: emp.middleName,
  lastName: emp.lastName,
  LAST_NAME: emp.lastName,
  name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
  NAME: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
  email: emp.email,
  EMAIL: emp.email,
  gender: emp.gender,
  GENDER: emp.gender,
  address: emp.address,
  ADDRESS: emp.address,
  designation: emp.designation,
  role: emp.role,
  isAdmin: emp.role === "ORG_ADMIN" || emp.role === "SUPER_ADMIN",
  IS_ADMIN: emp.role === "ORG_ADMIN" || emp.role === "SUPER_ADMIN",
  departmentId: emp.departmentId,
  DEPARTMENT_ID: emp.departmentId,
  managerId: emp.managerId,
  MANAGER_ID: emp.managerId,
  organizationId: emp.organizationId,
  ORGANIZATION_ID: emp.organizationId,
});

// GET CURRENT USER PROFILE
exports.getUser = async (req, res) => {
  const userId = res.locals.id || req.employeeId;
  try {
    const user = await prisma.employee.findUnique({
      where: { id: userId },
      include: {
        department: true,
        manager: true,
        organization: true,
      },
    });

    if (!user || user.deletedAt) {
      return error(res, "User not found", 404);
    }

    return success(res, formatEmployeeResponse(user), "User fetched successfully");
  } catch (err) {
    console.error("Error in getUser:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// GET ALL EMPLOYEE NAMES (FOR DROPDOWNS & MANAGERS)
exports.getAllUsers = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  try {
    const employees = await prisma.employee.findMany({
      where: {
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
      orderBy: { firstName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      EMPLOYEE_ID: emp.id,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
      NAME: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
      email: emp.email,
    }));

    return success(res, formatted, "Employees fetched successfully");
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// REGISTER A NEW USER (INVITED / ADDED BY ADMIN)
exports.registerUser = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  const {
    firstName,
    middleName,
    lastName,
    email: rawEmail,
    password,
    gender,
    address,
    managerId,
    departmentId,
    isAdmin,
  } = req.body;

  if (!firstName || !lastName || !rawEmail || !password || !gender) {
    return error(res, "All fields are required", 400);
  }

  const normalizedEmail = rawEmail.toLowerCase().trim();

  try {
    // Check if email already exists
    const existing = await prisma.employee.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return error(res, "Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Resolve organization: use admin's organization, or fallback to first org if seeding
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      const defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) {
        return error(res, "No organization found. Please initialize an organization first.", 400);
      }
      targetOrgId = defaultOrg.id;
    }

    const newEmployee = await prisma.employee.create({
      data: {
        organizationId: targetOrgId,
        firstName,
        middleName: middleName || null,
        lastName,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        gender,
        address: address || null,
        managerId: managerId && managerId !== 0 ? managerId : null,
        departmentId: departmentId && departmentId !== 0 ? departmentId : null,
        role: isAdmin ? "ORG_ADMIN" : "EMPLOYEE",
      },
    });

    return success(res, formatEmployeeResponse(newEmployee), "User registered successfully", 201);
  } catch (err) {
    console.error("Registration failed:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// LOGIN A USER
exports.loginUser = async (req, res) => {
  const { email: rawEmail, password } = req.body;

  if (!rawEmail || !password) {
    return error(res, "Email and password are required", 400);
  }

  const normalizedEmail = rawEmail.toLowerCase().trim();

  try {
    const user = await prisma.employee.findUnique({
      where: { email: normalizedEmail },
      include: { department: true },
    });

    if (!user || user.deletedAt) {
      return error(res, "Invalid email or password", 401);
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return error(res, "Invalid email or password", 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        organizationId: user.organizationId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie for secure browser access
    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    const userPayload = formatEmployeeResponse(user);
    return res.status(200).json({
      success: true,
      token,
      data: userPayload,
      recordset: [userPayload],
      recordsets: [[userPayload]],
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login failed:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email: rawEmail } = req.body;
  if (!rawEmail) {
    return error(res, "Email is required", 400);
  }

  try {
    const user = await prisma.employee.findUnique({
      where: { email: rawEmail.toLowerCase().trim() },
    });

    if (!user || user.deletedAt) {
      return error(res, "User not found", 404);
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return success(res, { resetToken }, "Password reset token generated");
  } catch (err) {
    console.error("Forgot password failed:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  if (!password || !resetToken) {
    return error(res, "Password and token are required", 400);
  }

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return error(res, "Invalid or expired token", 401);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.employee.update({
      where: { id: decoded.id },
      data: { passwordHash: hashedPassword },
    });

    return success(res, null, "Password reset successfully");
  } catch (err) {
    console.error("Reset password failed:", err);
    return error(res, "Invalid or expired token", 401);
  }
};

// GET EMPLOYEE PROFILE DETAILS
exports.getEmployeeProfile = async (req, res) => {
  const employeeId = res.locals.id || req.employeeId;
  try {
    const emp = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        manager: true,
      },
    });

    if (!emp || emp.deletedAt) {
      return error(res, "Employee not found", 404);
    }

    const profile = {
      FIRST_NAME: emp.firstName,
      firstName: emp.firstName,
      LAST_NAME: emp.lastName,
      lastName: emp.lastName,
      EMAIL: emp.email,
      email: emp.email,
      GENDER: emp.gender,
      gender: emp.gender,
      ADDRESS: emp.address,
      address: emp.address,
      DEPARTMENT_NAME: emp.department?.name || "Not Assigned",
      departmentName: emp.department?.name || "Not Assigned",
      MANAGER_NAME: emp.manager
        ? `${emp.manager.firstName || ""} ${emp.manager.lastName || ""}`.trim()
        : "None",
      managerName: emp.manager
        ? `${emp.manager.firstName || ""} ${emp.manager.lastName || ""}`.trim()
        : "None",
    };

    return success(res, profile, "Profile fetched successfully");
  } catch (err) {
    console.error("Get profile failed:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// GET ALL EMPLOYEES (FOR ADMIN DIRECTORY)
exports.getAllEmployees = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  try {
    const employees = await prisma.employee.findMany({
      where: {
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
      include: {
        department: true,
        manager: true,
      },
      orderBy: { firstName: "asc" },
    });

    const formatted = employees.map((e) => ({
      EMPLOYEE_ID: e.id,
      id: e.id,
      NAME: `${e.firstName || ""} ${e.lastName || ""}`.trim(),
      name: `${e.firstName || ""} ${e.lastName || ""}`.trim(),
      DEPARTMENT_NAME: e.department?.name || "Not Assigned",
      departmentName: e.department?.name || "Not Assigned",
      MANAGER_NAME: e.manager
        ? `${e.manager.firstName || ""} ${e.manager.lastName || ""}`.trim()
        : "None",
      managerName: e.manager
        ? `${e.manager.firstName || ""} ${e.manager.lastName || ""}`.trim()
        : "None",
      ROLE: e.role,
      role: e.role,
      EMAIL: e.email,
      email: e.email,
    }));

    return success(res, formatted, "Employees directory fetched successfully");
  } catch (err) {
    console.error("Get all employees failed:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// DELETE AN EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    // Soft delete to maintain audit log & document signature integrity
    const updated = await prisma.employee.updateMany({
      where: {
        id,
        organizationId: organizationId || undefined,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return error(res, "Employee not found or already deleted", 404);
    }

    return success(res, null, "Employee deleted successfully");
  } catch (err) {
    console.error("Delete employee failed:", err);
    return error(res, "Internal Server Error", 500);
  }
};
