import { Friend } from "../models/Friend.js";
import { FriendRequest } from "../models/FriendRequest.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import { getUserById } from "./userService.js";
import { emitToUser } from "../socket/index.js";
import {
  emitFriendRequestReceived,
  emitFriendRequestAccepted,
  emitFriendRequestDeleted,
} from "../socket/friendSocket.js";
import {
  sendRequest,
  getRequestById,
  deleteRequest,
  getAllSentRequest,
  getAllSReceivedRequest,
} from "./friendRequestService.js";

export const checkRelation = async (userA, userB, from, to) => {
  const [alreadyFriends, existingRequest] = await Promise.all([
    Friend.findOne({ userA, userB }),
    FriendRequest.findOne({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    }),
  ]);
  if (alreadyFriends)
    throw new ApiError(400, "Bạn đã là bạn bè với người này");
  if (existingRequest) throw new ApiError(400, "Đã có lời kết bạn này");
};

export const createFriend = async (userA, userB) => {
  return await Friend.create({
    userA,
    userB,
  });
};

export const getAllFriendShips = async (userId) => {
  return await Friend.find({
    $or: [{ userA: userId }, { userB: userId }],
  })
    .populate("userA", "_id displayName avatarUrl")
    .populate("userB", "_id displayName avatarUrl")
    .lean();
};

export const sendFriendRequestService = async (from, to, message) => {
  if (to === from.toString()) {
    throw new ApiError(400, "Không thể gửi lời mời cho chính mình");
  }

  await getUserById(to);

  let userA = to.toString();
  let userB = from.toString();
  if (userA > userB) {
    [userA, userB] = [userB, userA];
  }

  await checkRelation(userA, userB, from, to);
  const request = await sendRequest(from, to, message);

  try {
    const senderObj = await User.findById(from).select("displayName avatarUrl").lean();
    const notification = await Notification.create({
      recipient: to,
      sender: from,
      type: "friend_request",
      content: `${senderObj.displayName} đã gửi cho bạn một lời mời kết bạn.`,
      relatedId: request._id,
    });
    emitToUser(to, "new-notification", {
      ...notification.toObject(),
      sender: senderObj,
    });
  } catch (e) {}

  try {
    const populatedRequest = await FriendRequest.findById(request._id)
      .populate("from", "_id username displayName avatarUrl")
      .populate("to", "_id username displayName avatarUrl")
      .lean();
    emitFriendRequestReceived(to.toString(), populatedRequest);
  } catch (e) {}

  return {
    message: "Gửi lời mời kết bạn thành công",
    request,
  };
};

export const acceptFriendRequestService = async (userId, requestId) => {
  const request = await getRequestById(requestId);
  if (userId.toString() !== request.to.toString()) {
    throw new ApiError(403, "Bạn không có quyền chấp nhận yêu cầu này");
  }

  const friend = await createFriend(request.from, request.to);
  await deleteRequest(requestId);

  try {
    const accepterObj = await User.findById(userId).select("_id username displayName avatarUrl").lean();
    const senderObj = await User.findById(request.from).select("_id username displayName avatarUrl").lean();

    const notification = await Notification.create({
      recipient: request.from,
      sender: userId,
      type: "friend_accept",
      content: `${accepterObj.displayName} đã chấp nhận lời mời kết bạn của bạn.`,
      relatedId: friend._id,
    });
    emitToUser(request.from, "new-notification", {
      ...notification.toObject(),
      sender: accepterObj,
    });

    emitFriendRequestAccepted(request.from.toString(), {
      requestId,
      friend: accepterObj,
    });
    emitFriendRequestAccepted(userId.toString(), {
      requestId,
      friend: senderObj,
    });
  } catch (e) {}

  return { message: "Chấp nhận lời mời kết bạn thành công" };
};

export const deleteFriendRequestService = async (requestId) => {
  const request = await getRequestById(requestId);
  await deleteRequest(requestId);

  try {
    emitFriendRequestDeleted(request.from.toString(), { requestId });
    emitFriendRequestDeleted(request.to.toString(), { requestId });
  } catch (e) {}
};

export const getAllFriendsService = async (userId) => {
  const friendShips = await getAllFriendShips(userId);
  if (!friendShips.length) {
    return [];
  }
  return friendShips.map((f) =>
    f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
  );
};

export const getAllFriendRequestService = async (userId) => {
  const sent = await getAllSentRequest(userId);
  const received = await getAllSReceivedRequest(userId);
  return { sent, received };
};

export const getFriendSuggestions = async (userId, page = 1, limit = 8) => {
  const friendships = await Friend.find({
    $or: [{ userA: userId }, { userB: userId }]
  }).lean();
  const friendsSet = new Set(
    friendships.map(f => f.userA.toString() === userId.toString() ? f.userB.toString() : f.userA.toString())
  );

  const pendingRequests = await FriendRequest.find({
    $or: [{ from: userId }, { to: userId }]
  }).lean();
  const pendingSet = new Set(
    pendingRequests.map(r => r.from.toString() === userId.toString() ? r.to.toString() : r.from.toString())
  );

  const excluded = new Set([userId.toString(), ...friendsSet, ...pendingSet]);

  const fofCounts = {};
  for (const friendId of friendsSet) {
    const fofFriendships = await Friend.find({
      $or: [{ userA: friendId }, { userB: friendId }]
    }).lean();
    for (const f of fofFriendships) {
      const fofId = f.userA.toString() === friendId ? f.userB.toString() : f.userA.toString();
      if (!excluded.has(fofId)) {
        fofCounts[fofId] = (fofCounts[fofId] || 0) + 1;
      }
    }
  }

  let candidates = Object.keys(fofCounts).map(id => ({
    userId: id,
    mutualCount: fofCounts[id]
  })).sort((a, b) => b.mutualCount - a.mutualCount);

  let suggestions = [];

  if (candidates.length > 0) {
    const candidateUserIds = candidates.map(c => c.userId);
    const candidateUsers = await User.find({ _id: { $in: candidateUserIds } })
      .select("_id displayName username avatarUrl")
      .lean();
    suggestions = candidates.map(c => {
      const userObj = candidateUsers.find(u => u._id.toString() === c.userId);
      return {
        ...userObj,
        mutualCount: c.mutualCount
      };
    }).filter(s => s._id);
  }

  const targetCap = 80;
  if (suggestions.length < targetCap) {
    const gatheredIds = suggestions.map(s => s._id.toString());
    const finalExcluded = [...Array.from(excluded), ...gatheredIds];
    const randomUsers = await User.find({
      _id: { $nin: finalExcluded }
    })
      .limit(targetCap - suggestions.length)
      .select("_id displayName username avatarUrl")
      .lean();

    suggestions = [
      ...suggestions,
      ...randomUsers.map(u => ({ ...u, mutualCount: 0 }))
    ];
  }

  const skip = (page - 1) * limit;
  const paginatedSuggestions = suggestions.slice(skip, skip + limit);

  return {
    suggestions: paginatedSuggestions,
    totalPages: Math.ceil(suggestions.length / limit),
    currentPage: page,
    totalSuggestions: suggestions.length
  };
};
