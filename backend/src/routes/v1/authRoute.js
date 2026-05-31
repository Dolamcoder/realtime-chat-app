import express from "express";
const router=express.Router()
import { register, login, logOut, refreshToken } from "../../controllers/authController.js";
router.post("/register", register)
router.post("/login", login)
router.post("/logout", logOut)
router.post("/refresh", refreshToken )
export default router