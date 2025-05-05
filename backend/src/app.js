
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
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "https://cloud-box-storage-one.vercel.app"
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
