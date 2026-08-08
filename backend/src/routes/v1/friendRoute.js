import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getAllFriendRequest,
  deleteFriendRequest,
  getAllFriends,
  getSuggestions,
} from "../../controllers/friendController.js";
import { validate } from "../../middlewares/validationMiddleware.js";
import { friendValidation } from "../../validations/friendValidation.js";

const router = express.Router();

router.get("/", getAllFriends);
router.get("/suggestions", getSuggestions);
router.post("/requests", validate(friendValidation.sendFriendRequest), sendFriendRequest);
router.get("/requests", getAllFriendRequest);
router.post("/requests/:requestId", acceptFriendRequest);
router.delete("/requests/:requestId", deleteFriendRequest);

export default router;