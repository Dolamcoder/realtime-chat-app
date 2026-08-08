import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
  clearConversation,
  deleteGroup,
  addMembers,
  removeMember,
} from "../../controllers/conversationController.js";
import { checkFriendship } from "../../middlewares/friendMiddleware.js";
import { validate } from "../../middlewares/validationMiddleware.js";
import { conversationValidation } from "../../validations/conversationValidation.js";

const router = express.Router();

router.post("/", validate(conversationValidation.createConversation), checkFriendship, createConversation);
router.get("/", getConversations);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/seen", markAsSeen);
router.patch("/:conversationId/clear", clearConversation);
router.delete("/:conversationId", deleteGroup);
router.post("/:conversationId/members", validate(conversationValidation.addMembers), addMembers);
router.delete("/:conversationId/members/:memberId", removeMember);

export default router;