import {checkUsername, checkEmail, hashPassword, checkPassword, createAccessToken} from '../services/authService.js';
import {createUser, getUserByUsername} from '../services/userService.js'
import { asyncHandler } from '../utils/asyncHandle.js';
import { saveRefreshToken, createRefreshToken, verifyRefreshToken} from '../services/sessionService.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstname, lastname } = req.body;
  console.log("checkk data client",  username, email, password, firstname, lastname )
  await checkEmail(email);
  await checkUsername(username);
  const hashedPassword = await hashPassword(password);
  await createUser({username, email, hashedPassword, displayName: `${firstname} ${lastname}` })
  return res.status(201).json({
    message: "Đăng ký thành công",
  });
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserByUsername(username);
  await checkPassword(password, user.hashedPassword);
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);
  await saveRefreshToken(user._id, refreshToken);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  
  return res.status(200).json({
    message: "Đăng nhập thành công",
    accessToken,
  });
});
export const logOut=asyncHandler(async(req, res)=>{
  const token=req.cookie?.refreshToken;
  if(token){
    await deleteRefreshToken(token);
    res.clearCookie("refreshToken");
  } 
  return res.sendStatus(204);
})
export const refreshToken=asyncHandler(async(req, res)=>{
  const token=req.cookies?.refreshToken;
  console.log("check cookie", token);
  const userId= await verifyRefreshToken(token);
  const accessToken = createAccessToken(userId);
  res.status(200).json({accessToken})
})