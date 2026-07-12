import { Router } from "express";
import {
    register,
    login,
    refresh,
    logout,
    me,
} from "../controllers/auth.controller.js";
import { validate, registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authenticate } from "../middleware/authenticate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// ── Public routes ──────────────────────────────────────────────

// POST /api/auth/register — Create a new account
router.post("/register", authLimiter, validate(registerSchema), register);

// POST /api/auth/login — Authenticate and receive tokens
router.post("/login", authLimiter, validate(loginSchema), login);

// POST /api/auth/refresh — Rotate refresh token, get new access token
router.post("/refresh", refresh);

// POST /api/auth/logout — Destroy session and clear cookie
router.post("/logout", logout);

// ── Protected routes ───────────────────────────────────────────

// GET /api/auth/me — Get current authenticated user profile
router.get("/me", authenticate, me);

export default router;
