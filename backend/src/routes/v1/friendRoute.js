import express from "express";
const router=express.Router();
import {sendFriendRequest, acceptFriendRequest, getAllFriendRequest, deleteFriendRequest, getAllFriends} from "../../controllers/friendController.js";
router.get("/", getAllFriends);
router.post("/requests", sendFriendRequest);
router.get("/requests", getAllFriendRequest);
router.post("/requests/:requestId", acceptFriendRequest);
router.delete("/requests/:requestId",deleteFriendRequest );
export default router;