import { Session } from "../models/Session.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
export const createRefreshToken = (userId) => {
  try {
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );
    return refreshToken;
  } catch (err) {
    throw err;
  }
};
export const saveRefreshToken = async (userId, refreshToken) => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await Session.findOneAndUpdate(
      { userId },
      { refreshToken, expiresAt },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  } catch (err) {
    throw err;
  }
};
export const deleteRefreshToken = async (refreshToken) => {
  try {
    await Session.deleteOne({ refreshToken });
  } catch (err) {
    throw err;
  }
};
export const verifyRefreshToken = async (refreshToken) => {
  try {
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      console.log("lỗi ở đây");
      throw new ApiError(404, "Token không tồn tại");
    }
    jwt.verify(refreshToken, process.env.REFRRESH_TOKEN_SECRET);
    return session.userId;
  } catch (error) {
    throw new ApiError(403, "token không hợp lệ hoặc đã hết hạn");
  }
};
