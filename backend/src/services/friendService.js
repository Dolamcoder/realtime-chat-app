import { Friend } from "../models/Friend.js";
import { FriendRequest } from "../models/FriendRequest.js";
import ApiError from "../utils/ApiError.js";
export const checkRelation = async (userA, userB, from, to) => {
  try {
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
  } catch (err) {
    throw err;
  }
};
export const createFriend = async (userA, userB) => {
  try {
    return await Friend.create({
      userA,
      userB,
    });
  } catch (err) {
    throw err;
  }
};
export const getAllFriendShips = async (userId) => {
  try {
    const friendShips = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "_id displayName avatarUrl")
      .populate("userB", "_id displayName avatarUrl")
      .lean();
    return friendShips;
  } catch (err) {
    throw err;
    return null;
  }
};
