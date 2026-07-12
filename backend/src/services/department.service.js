import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

const departmentSelect = {
    departmentId: true,
    name: true,
    parentDepartmentId: true,
    headUserId: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    parent: {
        select: {
            departmentId: true,
            name: true,
        },
    },
    head: {
        select: {
            userId: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    },
    _count: {
        select: {
            users: true,
            children: true,
        },
    },
};

const assertDepartmentExists = async (departmentId) => {
    const department = await prisma.department.findUnique({
        where: { departmentId },
        select: { departmentId: true, parentDepartmentId: true, status: true },
    });

    if (!department) {
        throw new ApiError(404, "Department not found");
    }

    return department;
};

const assertValidHeadUser = async (headUserId) => {
    if (headUserId === undefined || headUserId === null) {
        return;
    }

    const user = await prisma.user.findUnique({
        where: { userId: headUserId },
        select: { userId: true, status: true },
    });

    if (!user) {
        throw new ApiError(400, "headUserId does not reference an existing user");
    }

    if (user.status !== "Active") {
        throw new ApiError(400, "head user must be Active");
    }
};

const assertNoParentCycle = async (departmentId, proposedParentDepartmentId) => {
    if (proposedParentDepartmentId === undefined || proposedParentDepartmentId === null) {
        return;
    }

    if (departmentId === proposedParentDepartmentId) {
        throw new ApiError(400, "Department cannot be its own parent");
    }

    let cursor = proposedParentDepartmentId;

    while (cursor) {
        if (cursor === departmentId) {
            throw new ApiError(400, "Parent hierarchy cycle detected");
        }

        const current = await prisma.department.findUnique({
            where: { departmentId: cursor },
            select: { parentDepartmentId: true },
        });

        if (!current) {
            throw new ApiError(400, "parentDepartmentId does not reference an existing department");
        }

        cursor = current.parentDepartmentId;
    }
};

const assertUniqueDepartmentName = async (name, excludingDepartmentId) => {
    if (!name) {
        return;
    }

    const existing = await prisma.department.findFirst({
        where: {
            name,
            ...(excludingDepartmentId ? { departmentId: { not: excludingDepartmentId } } : {}),
        },
        select: { departmentId: true },
    });

    if (existing) {
        throw new ApiError(409, "Department name already exists");
    }
};

export const listDepartments = async (filters) => {
    const { page, limit, search, status, parentDepartmentId } = filters;

    const where = {
        ...(status ? { status } : {}),
        ...(search
            ? {
                  OR: [
                      { name: { contains: search } },
                      { parent: { name: { contains: search } } },
                  ],
              }
            : {}),
        ...(parentDepartmentId ? { parentDepartmentId } : {}),
    };

    const [items, total] = await prisma.$transaction([
        prisma.department.findMany({
            where,
            select: departmentSelect,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.department.count({ where }),
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

export const createDepartment = async (payload) => {
    await assertUniqueDepartmentName(payload.name);

    if (payload.parentDepartmentId !== undefined) {
        await assertDepartmentExists(payload.parentDepartmentId);
    }

    await assertValidHeadUser(payload.headUserId);

    const created = await prisma.department.create({
        data: {
            name: payload.name,
            ...(payload.parentDepartmentId !== undefined
                ? { parentDepartmentId: payload.parentDepartmentId }
                : {}),
            ...(payload.headUserId !== undefined ? { headUserId: payload.headUserId } : {}),
        },
        select: departmentSelect,
    });

    return created;
};

export const updateDepartment = async (departmentId, payload) => {
    await assertDepartmentExists(departmentId);

    if (payload.name !== undefined) {
        await assertUniqueDepartmentName(payload.name, departmentId);
    }

    if (payload.parentDepartmentId !== undefined) {
        await assertNoParentCycle(departmentId, payload.parentDepartmentId);
    }

    if (payload.headUserId !== undefined) {
        await assertValidHeadUser(payload.headUserId);
    }

    const updated = await prisma.department.update({
        where: { departmentId },
        data: payload,
        select: departmentSelect,
    });

    return updated;
};

export const patchDepartmentStatus = async (departmentId, status) => {
    await assertDepartmentExists(departmentId);

    if (status === "Inactive") {
        const activeUsers = await prisma.user.count({
            where: {
                departmentId,
                status: "Active",
            },
        });

        if (activeUsers > 0) {
            throw new ApiError(
                409,
                "Cannot deactivate department while active users are assigned",
                [{ field: "departmentId", message: "Reassign or deactivate users first" }]
            );
        }
    }

    const updated = await prisma.department.update({
        where: { departmentId },
        data: { status },
        select: departmentSelect,
    });

    return updated;
};
