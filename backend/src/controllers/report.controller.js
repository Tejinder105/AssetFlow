import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import * as reportService from "../services/report.service.js";

// GET /api/reports/utilization
export const utilizationByDepartment = asyncHandler(async (_req, res) => {
    const data = await reportService.utilizationByDepartment();
    res.status(200).json(new ApiResponse(200, data, "Utilization report fetched"));
});

// GET /api/reports/maintenance-frequency
export const maintenanceFrequency = asyncHandler(async (_req, res) => {
    const data = await reportService.maintenanceFrequency();
    res.status(200).json(new ApiResponse(200, data, "Maintenance frequency report fetched"));
});

// GET /api/reports/usage
export const mostUsedIdleAssets = asyncHandler(async (_req, res) => {
    const data = await reportService.mostUsedIdleAssets();
    res.status(200).json(new ApiResponse(200, data, "Asset usage report fetched"));
});

// GET /api/reports/booking-heatmap
export const bookingHeatmap = asyncHandler(async (_req, res) => {
    const data = await reportService.bookingHeatmap();
    res.status(200).json(new ApiResponse(200, data, "Booking heatmap fetched"));
});
