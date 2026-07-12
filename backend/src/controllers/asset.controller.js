import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import * as assetService from "../services/asset.service.js";

// GET /api/v1/assets
export const listAssets = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { assets, total } = await assetService.listAssets(req.query, pagination, req.user);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(assets, total, pagination.page, pagination.limit), "Assets fetched")
    );
});

// GET /api/v1/assets/:id
export const getAsset = asyncHandler(async (req, res) => {
    const assetId = parseInt(req.params.id, 10);
    const asset = await assetService.getAssetById(assetId, req.user);

    res.status(200).json(new ApiResponse(200, { asset }, "Asset fetched"));
});

// POST /api/v1/assets
export const createAsset = asyncHandler(async (req, res) => {
    const asset = await assetService.createAsset({
        ...req.body,
        createdBy: req.user.userId,
    });

    res.status(201).json(new ApiResponse(201, { asset }, "Asset registered"));
});
