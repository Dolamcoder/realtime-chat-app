import express from "express";
const router=express.Router();
import {authMe, searchUsers} from "../../controllers/userController.js";
router.get("/me", authMe);
router.get("/search", searchUsers);
export default router;