import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import * as activityLogService from "../services/activityLog.service.js";

// GET /api/activity-logs
export const listActivityLogs = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { logs, total } = await activityLogService.listLogs(req.query, pagination);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(logs, total, pagination.page, pagination.limit), "Activity logs fetched")
    );
});
