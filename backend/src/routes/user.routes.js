import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Basic user routes
// These can be expanded based on your specific requirements
router.get("/profile", verifyJWT, (req, res) => {
  // The user is already attached to req by the verifyJWT middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    },
    message: "User profile fetched successfully"
  });
});

export default router;