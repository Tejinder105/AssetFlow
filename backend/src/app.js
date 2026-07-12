import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import env from "./config/env.config.js";
<<<<<<< HEAD
import { errorHandler } from "./middleware/errorHandler.middleware.js";
=======
import { errorHandler } from "./middleware/errorHandler.js";
>>>>>>> aa3b04b4a89fd828763bb50ef116f33d78491894
import apiRouter from "./routes/index.js";

const app = express();

// ── Security ───────────────────────────────────────────────────
app.use(helmet());

app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

// ── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

<<<<<<< HEAD
// ── Health Check ───────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy" });
});
=======
app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "AssetFlow API is running" });
});

app.use("/api", apiRouter);
>>>>>>> aa3b04b4a89fd828763bb50ef116f33d78491894

// ── API Routes (central router) ────────────────────────────────
app.use("/api", apiRouter);

// ── Centralized Error Handler (must be last) ───────────────────
app.use(errorHandler);

export { app };
