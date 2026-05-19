import express from "express";
const router=express.Router();
import {authMe} from "../../controllers/userController.js";
router.get("/me", authMe);
export default router;