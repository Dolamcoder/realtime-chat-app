import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
  clearConversation,
  deleteGroup,
} from "../../controllers/conversationController.js";
import { checkFriendship } from "../../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/seen", markAsSeen);
router.patch("/:conversationId/clear", clearConversation);
router.delete("/:conversationId", deleteGroup);

export default router;