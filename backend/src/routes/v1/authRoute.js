import express from "express";
import {
  register,
  login,
  logOut,
  refreshToken,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  resetPassword,
} from "../../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logOut);
router.post("/refresh", refreshToken);

export default router;