import { Router } from "express";

const router = Router();

// TODO: Implement user management routes (CRUD, role updates, etc.)
// These routes will be protected by authenticate + authorize middleware.
//
// Example:
//   import { authenticate } from "../middleware/authenticate.middleware.js";
//   import { authorize } from "../middleware/authorize.js";
//
//   router.get("/", authenticate, authorize("Admin"), getAllUsers);
//   router.get("/:id", authenticate, getUserById);
//   router.patch("/:id/role", authenticate, authorize("Admin"), updateUserRole);

export default router;