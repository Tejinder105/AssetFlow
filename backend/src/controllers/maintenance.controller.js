import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import * as maintenanceService from "../services/maintenance.service.js";

// POST /api/maintenance
export const raiseRequest = asyncHandler(async (req, res) => {
    const request = await maintenanceService.raiseRequest({
        ...req.body,
        raisedBy: req.user.userId,
    });

    res.status(201).json(new ApiResponse(201, { request }, "Maintenance request raised"));
});

// PATCH /api/maintenance/:id/approve
export const approveRequest = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    const request = await maintenanceService.approveRequest(requestId, req.user.userId);

    res.status(200).json(new ApiResponse(200, { request }, "Maintenance request approved"));
});

// PATCH /api/maintenance/:id/reject
export const rejectRequest = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    const request = await maintenanceService.rejectRequest(requestId, req.user.userId);

    res.status(200).json(new ApiResponse(200, { request }, "Maintenance request rejected"));
});

// PATCH /api/maintenance/:id/assign
export const assignTechnician = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    const request = await maintenanceService.assignTechnician(requestId, req.body.technicianName);

    res.status(200).json(new ApiResponse(200, { request }, "Technician assigned"));
});

// PATCH /api/maintenance/:id/progress
export const updateProgress = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    const request = await maintenanceService.updateProgress(requestId);

    res.status(200).json(new ApiResponse(200, { request }, "Status updated to In Progress"));
});

// PATCH /api/maintenance/:id/resolve
export const resolveRequest = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    const request = await maintenanceService.resolveRequest(requestId, {
        ...req.body,
        resolvedBy: req.user.userId,
    });

    res.status(200).json(new ApiResponse(200, { request }, "Maintenance request resolved"));
});

// GET /api/maintenance
export const listByStatus = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { requests, total } = await maintenanceService.listByStatus(req.query, pagination);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(requests, total, pagination.page, pagination.limit), "Maintenance requests fetched")
    );
});
