import { asyncHandler } from "../utils/asyncHandle.js";
import {
  getNotificationsByUserId,
  markNotificationAsRead,
} from "../services/notificationService.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notifications = await getNotificationsByUserId(userId);
  return res.status(200).json({ notifications });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await markNotificationAsRead(id, userId);
  return res.status(200).json({ notification });
});
