import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import * as allocationService from "../services/allocation.service.js";

// POST /api/allocations
export const allocateAsset = asyncHandler(async (req, res) => {
    const allocation = await allocationService.allocate({
        ...req.body,
        allocatedBy: req.user.userId,
        actor: req.user,
    });

    res.status(201).json(new ApiResponse(201, { allocation }, "Asset allocated successfully"));
});

// POST /api/allocations/:id/return
export const returnAsset = asyncHandler(async (req, res) => {
    const allocationId = parseInt(req.params.id, 10);
    const allocation = await allocationService.returnAsset(allocationId, {
        ...req.body,
        returnedBy: req.user.userId,
    });

    res.status(200).json(new ApiResponse(200, { allocation }, "Asset returned successfully"));
});

// GET /api/allocations
export const listAllocations = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { allocations, total } = await allocationService.listAllocations(req.query, pagination, req.user);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(allocations, total, pagination.page, pagination.limit), "Allocations fetched")
    );
});

// GET /api/allocations/overdue
export const getOverdueAllocations = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { allocations, total } = await allocationService.getOverdue(pagination);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(allocations, total, pagination.page, pagination.limit), "Overdue allocations fetched")
    );
});
