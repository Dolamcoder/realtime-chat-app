import { Notification } from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";

export const getNotificationsByUserId = async (userId) => {
  try {
    return await Notification.find({ recipient: userId })
      .populate("sender", "_id displayName username avatarUrl")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  } catch (err) {
    throw err;
  }
};

export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new ApiError(404, "Không tìm thấy thông báo");
    }

    if (notification.recipient.toString() !== userId.toString()) {
      throw new ApiError(403, "Bạn không có quyền cập nhật thông báo này");
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  } catch (err) {
    throw err;
  }
};
