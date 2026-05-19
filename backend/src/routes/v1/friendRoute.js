import express from "express";
const router=express.Router();
import {sendFriendRequest, acceptFriendRequest, deleteFriendRequest} from "../../controllers/friendController.js";
router.post("/requests", sendFriendRequest);
router.post("/requests/:requestId", acceptFriendRequest);
router.delete("/requests/:requestId",deleteFriendRequest );
export default router;