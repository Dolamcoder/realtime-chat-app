import { queryUsers } from "../services/userService.js";
import { User } from "../models/User.js";
import { uploadToStorage } from "../services/storageService.js";
import { hashPassword, checkPassword } from "../services/authService.js";
import ApiError from "../utils/ApiError.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id;
    const users = await queryUsers(q, currentUserId);
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm người dùng", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, phone } = req.body;
    const userId = req.user._id;

    if (!displayName || displayName.trim() === "") {
      return res.status(400).json({ message: "Tên hiển thị không được để trống" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.displayName = displayName.trim();
    user.bio = bio ? bio.trim() : "";
    user.phone = phone ? phone.trim() : "";

    await user.save();

    // Do not return password hash
    const userObj = user.toObject();
    delete userObj.hashedPassword;

    return res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công",
      user: userObj
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật profile:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật thông tin" });
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh đại diện" });
    }

    const avatarUrl = await uploadToStorage(req.file);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.avatarUrl = avatarUrl;
    await user.save();

    const userObj = user.toObject();
    delete userObj.hashedPassword;

    return res.status(200).json({
      message: "Cập nhật ảnh đại diện thành công",
      user: userObj
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật avatar:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật ảnh đại diện" });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ mật khẩu cũ và mới" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Verify old password
    try {
      await checkPassword(oldPassword, user.hashedPassword);
    } catch (err) {
      return res.status(401).json({ message: err.message || "Mật khẩu cũ không chính xác" });
    }

    // Hash and save new password
    try {
      user.hashedPassword = await hashPassword(newPassword);
    } catch (err) {
      return res.status(400).json({ message: err.message || "Mật khẩu mới không hợp lệ" });
    }

    await user.save();

    return res.status(200).json({
      message: "Đổi mật khẩu thành công"
    });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi đổi mật khẩu" });
  }
};