import { queryUsers } from "../services/userService.js";

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