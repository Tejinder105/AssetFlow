import bcrypt from "bcrypt";
import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

const employeeSelect = {
    userId: true,
    name: true,
    email: true,
    departmentId: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    department: {
        select: {
            departmentId: true,
            name: true,
            status: true,
        },
    },
};

const assertEmployeeExists = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { userId },
        select: { userId: true },
    });

    if (!user) {
        throw new ApiError(404, "Employee not found");
    }
};

const assertDepartmentExists = async (departmentId) => {
    if (departmentId === undefined || departmentId === null) {
        return;
    }

    const department = await prisma.department.findUnique({
        where: { departmentId },
        select: { departmentId: true, status: true },
    });

    if (!department) {
        throw new ApiError(400, "departmentId does not reference an existing department");
    }

    if (department.status !== "Active") {
        throw new ApiError(400, "employee department must be Active");
    }
};

const ensureUniqueEmail = async (email, excludingUserId) => {
    const existing = await prisma.user.findFirst({
        where: {
            email,
            ...(excludingUserId ? { userId: { not: excludingUserId } } : {}),
        },
        select: { userId: true },
    });

    if (existing) {
        throw new ApiError(409, "Email already exists");
    }
};

export const listEmployees = async (filters) => {
    const { page, limit, search, departmentId, role, status } = filters;

    const where = {
        ...(departmentId ? { departmentId } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(search
            ? {
                  OR: [
                      { name: { contains: search } },
                      { email: { contains: search } },
                  ],
              }
            : {}),
    };

    const [items, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            select: employeeSelect,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    };
};

export const updateEmployee = async (userId, payload) => {
    await assertEmployeeExists(userId);

    if (payload.email !== undefined) {
        await ensureUniqueEmail(payload.email, userId);
    }

    if (payload.departmentId !== undefined) {
        await assertDepartmentExists(payload.departmentId);
    }

    const data = { ...payload };
    if (data.password !== undefined) {
        data.passwordHash = await bcrypt.hash(data.password, 10);
        delete data.password;
    }

    const employee = await prisma.user.update({
        where: { userId },
        data,
        select: employeeSelect,
    });

    return employee;
};

export const promoteRole = async (userId, role) => {
    await assertEmployeeExists(userId);

    const employee = await prisma.user.update({
        where: { userId },
        data: { role },
        select: employeeSelect,
    });

    return employee;
};

export const deactivateEmployee = async (userId) => {
    await assertEmployeeExists(userId);

    const employee = await prisma.user.update({
        where: { userId },
        data: { status: "Inactive" },
        select: employeeSelect,
    });

    return employee;
};
