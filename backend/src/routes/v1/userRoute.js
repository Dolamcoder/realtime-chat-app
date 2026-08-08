import express from "express";
import {
  authMe,
  searchUsers,
  updateProfile,
  updateAvatar,
  requestChangePasswordOtp,
  changePassword,
} from "../../controllers/userController.js";
import { upload } from "../../middlewares/uploadMiddleware.js";
import { validate } from "../../middlewares/validationMiddleware.js";
import { userValidation } from "../../validations/userValidation.js";

const router = express.Router();

router.get("/me", authMe);
router.get("/search", searchUsers);
router.put("/profile", validate(userValidation.updateProfile), updateProfile);
router.put("/avatar", upload.single("avatar"), updateAvatar);
router.post("/change-password-otp", requestChangePasswordOtp);
router.put("/change-password", validate(userValidation.changePassword), changePassword);

export default router;