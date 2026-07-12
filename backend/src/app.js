import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import helmet from "helmet";
import env from "./config/env.config.js";
import { errorHandler } from "./middleware/errorHandler.js";

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

// ── Routes ─────────────────────────────────────────────────────
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import departmentRouter from "./routes/department.routes.js";
import categoryRouter from "./routes/category.routes.js";
import employeeRouter from "./routes/employee.routes.js";

app.use("/api/auth", authRouter);
app.use("/api/v1/users", userRouter);

export { app };