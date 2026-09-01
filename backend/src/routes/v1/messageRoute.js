import express from "express";
import {
  sendMessage,
  recallMessage,
  searchMessages,
} from "../../controllers/messageController.js";
import { checkGroupMembership } from "../../middlewares/friendMiddleware.js";
import { upload } from "../../middlewares/uploadMiddleware.js";
import { validate } from "../../middlewares/validationMiddleware.js";
import { messageValidation } from "../../validations/messageValidation.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "file", maxCount: 1 },
  { name: "voice", maxCount: 1 },
]);

router.post("/", uploadFields, validate(messageValidation.sendMessage), checkGroupMembership, sendMessage);
router.patch("/:messageId/recall", recallMessage);
router.get("/conversations/:conversationId/search", searchMessages);

export default router;
