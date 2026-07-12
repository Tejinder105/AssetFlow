import { Router } from "express";
import { authenticate as verifyJWT } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
    listAssets,
    getAsset,
    createAsset,
} from "../controllers/asset.controller.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(listAssets)
    .post(requireRole("Admin", "Asset Manager"), createAsset);

router.get("/:id", getAsset);

export default router;
