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

const router = express.Router();

router.get("/me", authMe);
router.get("/search", searchUsers);
router.put("/profile", updateProfile);
router.put("/avatar", upload.single("avatar"), updateAvatar);
router.post("/change-password-otp", requestChangePasswordOtp);
router.put("/change-password", changePassword);

export default router;