import { asyncHandler } from "../utils/asyncHandle.js";
import { getUserById } from "../services/userService.js";
import {
  checkRelation,
  createFriend,
  getAllFriendShips,
} from "../services/friendService.js";
import {
  sendRequest,
  getRequestById,
  deleteRequest,
  getAllSentRequest,
  getAllSReceivedRequest,
} from "../services/friendRequestService.js";
export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { to, message } = req.body;
  const from = req.user._id;
  if (to === from) {
    return res
      .status(400)
      .json({ message: "Không thể gửi lời mời cho chính mình" });
  }
  const user = await getUserById(to);
  let userA = to.toString();
  let userB = from.toString();
  if (userA > userB) {
    [userA, userB] = [userB, userA];
  }
  await checkRelation(userA, userB, from, to);
  const request = await sendRequest(from, to, message);
  return res.status(200).json({
    message: "Gửi lời mời kết bạn thành công",
    request,
  });
});
export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;
  console.log("userId", userId.toString());
  const request = await getRequestById(requestId);
  console.log("to", request.to.toString());
  if (userId.toString() !== request.to.toString()) {
    return res.status(403).json({
      message: "Bạn không có quyền chấp nhận yêu cầu này",
    });
  }
  const friend = await createFriend(request.from, request.to);
  await deleteRequest(requestId);
  return res
    .status(200)
    .json({ message: "Chấp nhận lời mời kết bạn thành công" });
});
export const deleteFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const request = await getRequestById(requestId);
  await deleteRequest(requestId);
  return res.sendStatus(204);
});
export const getAllFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const friendShips = await getAllFriendShips(userId);
  if (!friendShips.length) {
    return res.status(200).json({ friends: [] });
  }
  const friends = friendShips.map((f) =>
    f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
  );
  return res.status(200).json({ friends });
});
export const getAllFriendRequest = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sent = await getAllSentRequest(userId);
  const received = await getAllSReceivedRequest(userId);
  return res.status(200).json({sent, received});
});
