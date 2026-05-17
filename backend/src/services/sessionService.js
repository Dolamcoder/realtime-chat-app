import { Session } from '../models/Session.js';
import jwt from 'jsonwebtoken';
export const createRefreshToken = (userId) => {
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  return refreshToken;
};
export const saveRefreshToken = async (userId, refreshToken) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
  
  const session = await Session.findOneAndUpdate(
    { userId },
    { refreshToken, expiresAt },
    { upsert: true, new: true }
  );
  return session;
};
export const deleteRefreshToken = async (refreshToken) => {
  await Session.deleteOne({ refreshToken });
};
export const verifyRefreshToken = async (userId, refreshToken) => {
  try {
    const session = await Session.findOne({ userId, refreshToken });
    if (!session) {
      return false;
    }
    jwt.verify(refreshToken, process.env.REFRRESH_TOKEN_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};

