import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/login").post(loginUser);  // Fix route definition
router.route("/register").post(registerUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

export default router;