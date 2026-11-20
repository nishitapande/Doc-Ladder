const prisma = require("../config/prisma");
const { success, error } = require("../utils/response");

// GET ALL DEPARTMENTS FOR ORGANIZATION
exports.getAllDepartments = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  try {
    const departments = await prisma.department.findMany({
      where: {
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
      include: {
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            members: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = departments.map((d) => {
      const hodName = d.hod
        ? `${d.hod.firstName || ""} ${d.hod.lastName || ""}`.trim()
        : "Not Assigned";
      return {
        id: d.id,
        DEPARTMENT_ID: d.id,
        departmentName: d.name,
        DEPARTMENT_NAME: d.name,
        name: d.name,
        hodId: d.hodId,
        HOD_ID: d.hodId,
        hodName,
        HOD_NAME: hodName,
        totalEmployees: d._count.members,
        TOTAL_EMPLOYEES: d._count.members,
      };
    });

    return success(res, formatted, "Departments fetched successfully");
  } catch (err) {
    console.error("Error in getAllDepartments:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// GET A SINGLE DEPARTMENT BY ID
exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    const department = await prisma.department.findFirst({
      where: {
        id,
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
      include: {
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!department) {
      return error(res, "Department not found", 404);
    }

    const payload = {
      id: department.id,
      DEPARTMENT_ID: department.id,
      departmentName: department.name,
      DEPARTMENT_NAME: department.name,
      hodId: department.hodId,
      HOD_ID: department.hodId,
      hodName: department.hod
        ? `${department.hod.firstName || ""} ${department.hod.lastName || ""}`.trim()
        : null,
    };

    return success(res, payload, "Department fetched successfully");
  } catch (err) {
    console.error("Failed to get department:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// ADD NEW DEPARTMENT
exports.addDepartment = async (req, res) => {
  const organizationId = req.organizationId || res.locals.organizationId;
  const { departmentName, HOD_ID, hodId } = req.body;
  const resolvedHodId = hodId || HOD_ID;

  if (!departmentName) {
    return error(res, "Department Name is required", 400);
  }

  try {
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      const defaultOrg = await prisma.organization.findFirst();
      targetOrgId = defaultOrg?.id;
    }

    const newDepartment = await prisma.department.create({
      data: {
        organizationId: targetOrgId,
        name: departmentName.trim(),
        hodId: resolvedHodId && resolvedHodId !== 0 ? resolvedHodId : null,
      },
    });

    return success(res, newDepartment, "Department added successfully", 201);
  } catch (err) {
    console.error("Failed to add department:", err);
    if (err.code === "P2002") {
      return error(res, "A department with this name already exists", 400);
    }
    return error(res, "Internal Server Error", 500);
  }
};

// UPDATE / EDIT A DEPARTMENT
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { departmentName, hodId, HOD_ID } = req.body;
  const organizationId = req.organizationId || res.locals.organizationId;
  const resolvedHodId = hodId !== undefined ? hodId : HOD_ID;

  try {
    const updated = await prisma.department.updateMany({
      where: {
        id,
        organizationId: organizationId || undefined,
      },
      data: {
        name: departmentName ? departmentName.trim() : undefined,
        hodId: resolvedHodId && resolvedHodId !== 0 ? resolvedHodId : null,
      },
    });

    if (updated.count === 0) {
      return error(res, "Department not found", 404);
    }

    return success(res, null, "Department updated successfully");
  } catch (err) {
    console.error("Failed to update department:", err);
    return error(res, "Internal Server Error", 500);
  }
};

// DELETE A DEPARTMENT
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId || res.locals.organizationId;

  try {
    // Check if any active employees belong to this department
    const employeeCount = await prisma.employee.count({
      where: {
        departmentId: id,
        deletedAt: null,
      },
    });

    if (employeeCount > 0) {
      return error(
        res,
        `Cannot delete department: ${employeeCount} employee(s) are currently assigned to it. Reassign them first.`,
        400
      );
    }

    const deleted = await prisma.department.deleteMany({
      where: {
        id,
        organizationId: organizationId || undefined,
      },
    });

    if (deleted.count === 0) {
      return error(res, "Department not found", 404);
    }

    return success(res, null, "Department deleted successfully");
  } catch (err) {
    console.error("Failed to delete department:", err);
    return error(res, "Internal Server Error", 500);
  }
};
