import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User profile fetched successfully"));
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  
  if (!username && !email) {
    throw new ApiError(400, "At least one field is required to update");
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: username || req.user.username,
        email: email || req.user.email
      }
    },
    { new: true }
  ).select("-password -refreshToken");
  
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User profile updated successfully"));
});

export { getUserProfile, updateUserProfile };