import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import env from "./config/env.config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import departmentRouter from "./routes/department.routes.js";
import categoryRouter from "./routes/category.routes.js";
import employeeRouter from "./routes/employee.routes.js";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/employees", employeeRouter);

app.use(errorHandler);

export { app };