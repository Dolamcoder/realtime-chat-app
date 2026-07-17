import express from "express";
const router=express.Router();
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
import friendRoute from "./friendRoute.js"
import messageRoute from "./messageRoute.js";
import conversationRoute from "./conversationRoute.js";
import notificationRoute from "./notificationRoute.js";
import {authMiddleware} from "../../middlewares/authMiddleware.js"
router.use("/auth",  authRoute);
router.use("/users",authMiddleware,userRoute);
router.use("/friends", authMiddleware, friendRoute);
router.use("/messages", authMiddleware,messageRoute);
router.use("/conversations",authMiddleware, conversationRoute );
router.use("/notifications", authMiddleware, notificationRoute);
export default router;