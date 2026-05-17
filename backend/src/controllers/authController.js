import {checkUsername, checkEmail, hashPassword, checkPassword, createAccessToken} from '../services/authService.js';
import {createUser, getUserByUsername} from '../services/userService.js'
import { asyncHandler } from '../utils/asyncHandle.js';
import { saveRefreshToken, createRefreshToken, deleteRefreshToken} from '../services/sessionService.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  await checkEmail(email);
  await checkUsername(username);
  const hashedPassword = await hashPassword(password);
  await createUser({username, email, hashedPassword, displayName: `${firstName} ${lastName}` })
  res.status(201).json({
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
  
  res.status(200).json({
    message: "Đăng nhập thành công",
    accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    }
  });
});
export const logOut=asyncHandler(async(req, res)=>{
  const token=req.cookie?.refreshToken;
  if(token){
    await deleteRefreshToken(token);
    res.clearCookie("refreshToken");
  } 
  res.sendStatus(204);
})
