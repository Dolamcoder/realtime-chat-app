import { asyncHandler } from "../utils/asyncHandle.js";
import {
  registerService,
  verifyEmailService,
  resendVerificationOtpService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  logoutService,
  refreshAccessTokenService,
} from "../services/authService.js";

const getCookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === "production";
  const origin = req.headers.origin || "";
  const isHttpsOrigin = origin.startsWith("https://");
  const useSecure = isProduction || isHttpsOrigin;

  return {
    httpOnly: true,
    secure: useSecure,
    sameSite: useSecure ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export const register = asyncHandler(async (req, res) => {
  const result = await registerService(req.body);
  return res.status(201).json(result);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await verifyEmailService(req.body);
  return res.status(200).json(result);
});

export const resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await resendVerificationOtpService(email);
  return res.status(200).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, ...data } = await loginService(req.body);
  res.cookie("refreshToken", refreshToken, getCookieOptions(req));
  return res.status(200).json({
    ...data,
    accessToken,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await forgotPasswordService(email);
  return res.status(200).json(result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await resetPasswordService(req.body);
  return res.status(200).json(result);
});

export const logOut = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  await logoutService(token);
  const { maxAge: _, ...clearOptions } = getCookieOptions(req);
  res.clearCookie("refreshToken", clearOptions);
  return res.sendStatus(204);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const result = await refreshAccessTokenService(token);
  return res.status(200).json(result);
});