
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/files", fileRoutes);

// 404
app.use("*", (req, res, next) => {
  const err = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(err);
});

export default app;
