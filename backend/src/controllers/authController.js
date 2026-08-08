import { checkUsername, checkEmail, hashPassword, checkPassword, createAccessToken } from '../services/authService.js';
import { createUser, getUserByUsername } from '../services/userService.js'
import { asyncHandler } from '../utils/asyncHandle.js';
import { saveRefreshToken, createRefreshToken, deleteRefreshToken, verifyRefreshToken } from '../services/sessionService.js';
import ApiError from '../utils/ApiError.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstname, lastname } = req.body;
  console.log("checkk data client", username, email, password, firstname, lastname)
  await checkEmail(email);
  await checkUsername(username);
  const hashedPassword = await hashPassword(password);
  await createUser({ username, email, hashedPassword, displayName: `${firstname} ${lastname}` })
  return res.status(201).json({
    message: "Đăng ký thành công",
  });
});

const getCookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const origin = req.headers.origin || '';
  const isHttpsOrigin = origin.startsWith('https://');
  const useSecure = isProduction || isHttpsOrigin;

  return {
    httpOnly: true,
    secure: useSecure,
    sameSite: useSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};


export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserByUsername(username);
  await checkPassword(password, user.hashedPassword);
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);
  await saveRefreshToken(user._id, refreshToken);
  res.cookie('refreshToken', refreshToken, getCookieOptions(req));

  return res.status(200).json({
    message: "Đăng nhập thành công",
    accessToken,
  });
});
export const logOut = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await deleteRefreshToken(token);
    const { maxAge: _, ...clearOptions } = getCookieOptions(req);
    res.clearCookie("refreshToken", clearOptions);
  }
  return res.sendStatus(204);
})
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  console.log("check cookie", token);
  if (!token) {
    throw new ApiError(401, "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  const userId = await verifyRefreshToken(token);
  console.log("vdadsd", userId);
  const accessToken = createAccessToken(userId);
  console.log("<<< new access token", accessToken)
  res.status(200).json({ accessToken })
})