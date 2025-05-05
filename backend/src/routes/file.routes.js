import { Router } from "express";
import { uploadFile, getUserFiles, downloadFile, deleteFile } from "../controllers/file.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();


const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create
    const userDir = path.join(uploadsDir, req.user._id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// File routes
router.post("/upload", verifyJWT, upload.single("file"), uploadFile);
router.get("/", verifyJWT, getUserFiles);
router.get("/download/:fileId", verifyJWT, downloadFile);
router.delete("/:fileId", verifyJWT, deleteFile);

export default router;