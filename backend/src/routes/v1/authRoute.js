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
import { validate } from "../../middlewares/validationMiddleware.js";
import { authValidation } from "../../validations/authValidation.js";

const router = express.Router();

router.post("/register", validate(authValidation.register), register);
router.post("/verify-email", validate(authValidation.verifyEmail), verifyEmail);
router.post("/resend-verification", validate(authValidation.resendVerification), resendVerificationOtp);
router.post("/login", validate(authValidation.login), login);
router.post("/forgot-password", validate(authValidation.forgotPassword), forgotPassword);
router.post("/reset-password", validate(authValidation.resetPassword), resetPassword);
router.post("/logout", logOut);
router.post("/refresh", refreshToken);

export default router;