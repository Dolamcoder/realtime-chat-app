import express from "express";
const router=express.Router();
import {authMe, searchUsers, updateProfile, updateAvatar, changePassword} from "../../controllers/userController.js";
import { upload } from "../../middlewares/uploadMiddleware.js";

router.get("/me", authMe);
router.get("/search", searchUsers);
router.put("/profile", updateProfile);
router.put("/avatar", upload.single("avatar"), updateAvatar);
router.put("/change-password", changePassword);

export default router;