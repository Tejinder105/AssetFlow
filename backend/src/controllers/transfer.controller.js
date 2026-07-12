import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import * as transferService from "../services/transfer.service.js";

// POST /api/transfers
export const requestTransfer = asyncHandler(async (req, res) => {
    const transfer = await transferService.requestTransfer({
        ...req.body,
        requestedBy: req.user.userId,
        actor: req.user,
    });

    res.status(201).json(new ApiResponse(201, { transfer }, "Transfer request created"));
});

// PATCH /api/transfers/:id/approve
export const approveTransfer = asyncHandler(async (req, res) => {
    const transferId = parseInt(req.params.id, 10);
    const transfer = await transferService.approveTransfer(transferId, req.user);

    res.status(200).json(new ApiResponse(200, { transfer }, "Transfer approved"));
});

// PATCH /api/transfers/:id/reject
export const rejectTransfer = asyncHandler(async (req, res) => {
    const transferId = parseInt(req.params.id, 10);
    const transfer = await transferService.rejectTransfer(
        transferId,
        req.user,
        req.body.reason
    );

    res.status(200).json(new ApiResponse(200, { transfer }, "Transfer rejected"));
});

// GET /api/transfers
export const listTransfers = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { transfers, total } = await transferService.listTransfers(req.query, pagination, req.user);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(transfers, total, pagination.page, pagination.limit), "Transfers fetched")
    );
});
