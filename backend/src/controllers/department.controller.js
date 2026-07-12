import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {
    createDepartment,
    listDepartments,
    patchDepartmentStatus,
    updateDepartment,
} from "../services/department.service.js";
import { ApiError } from "../utils/apierror.js";

const parseDepartmentId = (value) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new ApiError(400, "Department id must be a positive integer");
    }
    return id;
};

export const listDepartmentsController = asyncHandler(async (req, res) => {
    const result = await listDepartments(req.query);

    return res.status(200).json(new ApiResponse(200, result, "Departments fetched successfully"));
});

export const createDepartmentController = asyncHandler(async (req, res) => {
    const department = await createDepartment(req.body);

    return res.status(201).json(new ApiResponse(201, department, "Department created successfully"));
});

export const updateDepartmentController = asyncHandler(async (req, res) => {
    const departmentId = parseDepartmentId(req.params.id);
    const department = await updateDepartment(departmentId, req.body);

    return res.status(200).json(new ApiResponse(200, department, "Department updated successfully"));
});

export const patchDepartmentStatusController = asyncHandler(async (req, res) => {
    const departmentId = parseDepartmentId(req.params.id);
    const department = await patchDepartmentStatus(departmentId, req.body.status);

    return res.status(200).json(new ApiResponse(200, department, "Department status updated successfully"));
});
