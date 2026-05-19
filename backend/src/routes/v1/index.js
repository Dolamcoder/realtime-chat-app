import express from "express";
const router=express.Router();
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
import friendRoute from "./friendRoute.js"
import {authMiddleware} from "../../middlewares/authMiddleware.js"
router.use("/auth",  authRoute);
router.use("/users",authMiddleware,userRoute);
router.use("/friends", authMiddleware, friendRoute);
export default router;