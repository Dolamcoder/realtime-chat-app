import express from "express";
const router = express.Router();
import {
  sendDirectMessage,
  sendGroupMessage,
} from "../../controllers/nessageController.js";
import {checkFriendship, checkGroupMembership} from "../../middlewares/friendMiddleware.js";
import { upload } from "../../middlewares/uploadMiddleware.js";

const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "file", maxCount: 1 },
  { name: "voice", maxCount: 1 },
]);

router.post("/direct", uploadFields, checkGroupMembership, sendDirectMessage);
router.post("/group", uploadFields, checkGroupMembership, sendGroupMessage);
export default router;
