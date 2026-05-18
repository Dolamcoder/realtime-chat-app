import express from "express";
const router=express.Router();
import {authMiddleware} from "../../middlewares/authMiddleware.js";
import {authMe} from "../../controllers/userController.js";
router.get("/me", authMiddleware, authMe);
export default router;