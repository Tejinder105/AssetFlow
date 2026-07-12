import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { ApiError } from "../utils/apierror.js";
import {
    deactivateEmployee,
    listEmployees,
    promoteRole,
    updateEmployee,
} from "../services/employee.service.js";

const parseEmployeeId = (value) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new ApiError(400, "Employee id must be a positive integer");
    }
    return id;
};

export const listEmployeesController = asyncHandler(async (req, res) => {
    const result = await listEmployees(req.query);
    return res.status(200).json(new ApiResponse(200, result, "Employees fetched successfully"));
});

export const updateEmployeeController = asyncHandler(async (req, res) => {
    const employeeId = parseEmployeeId(req.params.id);
    const employee = await updateEmployee(employeeId, req.body);
    return res.status(200).json(new ApiResponse(200, employee, "Employee updated successfully"));
});

export const promoteRoleController = asyncHandler(async (req, res) => {
    const employeeId = parseEmployeeId(req.params.id);
    const employee = await promoteRole(employeeId, req.body.role);
    return res.status(200).json(new ApiResponse(200, employee, "Employee role updated successfully"));
});

export const deactivateEmployeeController = asyncHandler(async (req, res) => {
    const employeeId = parseEmployeeId(req.params.id);
    const employee = await deactivateEmployee(employeeId);
    return res.status(200).json(new ApiResponse(200, employee, "Employee deactivated successfully"));
});
