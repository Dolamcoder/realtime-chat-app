import express from "express";
const router=express.Router();
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
router.use("/auth",  authRoute);
router.use("/users", userRoute);
export default router;