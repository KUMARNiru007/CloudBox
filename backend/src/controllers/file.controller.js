import { File } from "../models/file.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import path from "path";

// Upload a file
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const { filename, originalname, mimetype, size, path: filePath } = req.file;
  
  // Create file record in database
  const file = await File.create({
    filename,
    originalName: originalname,
    mimeType: mimetype,
    size,
    path: filePath,
    owner: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, file, "File uploaded successfully")
  );
});

// Get all files for the current user
const getUserFiles = asyncHandler(async (req, res) => {
  const files = await File.find({ owner: req.user._id });
  
  return res.status(200).json(
    new ApiResponse(200, files, "Files retrieved successfully")
  );
});

// Download a file
const downloadFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  
  const file = await File.findById(fileId);
  
  if (!file) {
    throw new ApiError(404, "File not found");
  }
  
  // Check if user owns the file
  if (file.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to access this file");
  }
  
  // Check if file exists on disk
  if (!fs.existsSync(file.path)) {
    throw new ApiError(404, "File not found on server");
  }
  
  res.download(file.path, file.originalName);
});

// Delete a file
const deleteFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  
  const file = await File.findById(fileId);
  
  if (!file) {
    throw new ApiError(404, "File not found");
  }
  
  // Check if user owns the file
  if (file.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to delete this file");
  }
  
  // Delete file from disk if it exists
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
  
  // Delete file record from database
  await File.findByIdAndDelete(fileId);
  
  return res.status(200).json(
    new ApiResponse(200, {}, "File deleted successfully")
  );
});

export { uploadFile, getUserFiles, downloadFile, deleteFile };