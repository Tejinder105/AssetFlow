import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import * as auditService from "../services/audit.service.js";

// POST /api/audits
export const createCycle = asyncHandler(async (req, res) => {
    const cycle = await auditService.createCycle({
        ...req.body,
        createdBy: req.user.userId,
    });

    res.status(201).json(new ApiResponse(201, { cycle }, "Audit cycle created"));
});

// POST /api/audits/:id/auditors
export const assignAuditors = asyncHandler(async (req, res) => {
    const auditCycleId = parseInt(req.params.id, 10);
    const cycle = await auditService.assignAuditors(auditCycleId, req.body.auditorUserIds);

    res.status(200).json(new ApiResponse(200, { cycle }, "Auditors assigned"));
});

// GET /api/audits/:id/items
export const listCycleAssets = asyncHandler(async (req, res) => {
    const auditCycleId = parseInt(req.params.id, 10);
    const pagination = parsePagination(req.query);
    const { items, total } = await auditService.listCycleAssets(auditCycleId, pagination);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(items, total, pagination.page, pagination.limit), "Audit items fetched")
    );
});

// PATCH /api/audits/:id/items/:itemId
export const markItem = asyncHandler(async (req, res) => {
    const auditItemId = parseInt(req.params.itemId, 10);
    const item = await auditService.markItem(auditItemId, {
        ...req.body,
        verifiedBy: req.user.userId,
    });

    res.status(200).json(new ApiResponse(200, { item }, "Audit item updated"));
});

// GET /api/audits/:id/discrepancies
export const getDiscrepancies = asyncHandler(async (req, res) => {
    const auditCycleId = parseInt(req.params.id, 10);
    const discrepancies = await auditService.getDiscrepancies(auditCycleId);

    res.status(200).json(new ApiResponse(200, { discrepancies }, "Discrepancies fetched"));
});

// PATCH /api/audits/:id/close
export const closeCycle = asyncHandler(async (req, res) => {
    const auditCycleId = parseInt(req.params.id, 10);
    const cycle = await auditService.closeCycle(auditCycleId, req.user.userId);

    res.status(200).json(new ApiResponse(200, { cycle }, "Audit cycle closed"));
});

// GET /api/audits
export const listCycles = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { cycles, total } = await auditService.listCycles(req.query, pagination);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(cycles, total, pagination.page, pagination.limit), "Audit cycles fetched")
    );
});
