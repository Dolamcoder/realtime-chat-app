import express from "express";
const router = express.Router();
import {
  sendDirectMessage,
  sendGroupMessage,
} from "../../controllers/nessageController.js";
import {checkFriendship, checkGroupMembership} from "../../middlewares/friendMiddleware.js"
router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);
export default router;
