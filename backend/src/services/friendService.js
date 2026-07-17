import { Friend } from "../models/Friend.js";
import { FriendRequest } from "../models/FriendRequest.js";
import { User } from "../models/User.js";
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

export const getFriendSuggestions = async (userId, page = 1, limit = 8) => {
  try {
    // 1. Fetch user's friends
    const friendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }]
    }).lean();
    const friendsSet = new Set(
      friendships.map(f => f.userA.toString() === userId.toString() ? f.userB.toString() : f.userA.toString())
    );

    // 2. Fetch user's sent & received requests
    const pendingRequests = await FriendRequest.find({
      $or: [{ from: userId }, { to: userId }]
    }).lean();
    const pendingSet = new Set(
      pendingRequests.map(r => r.from.toString() === userId.toString() ? r.to.toString() : r.from.toString())
    );

    // Exclude list: self + friends + pending
    const excluded = new Set([userId.toString(), ...friendsSet, ...pendingSet]);

    // 3. Count friends-of-friends (FoF)
    const fofCounts = {}; // friendOfFriendId -> count
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

    // Sort candidates by count
    let candidates = Object.keys(fofCounts).map(id => ({
      userId: id,
      mutualCount: fofCounts[id]
    })).sort((a, b) => b.mutualCount - a.mutualCount);

    let suggestions = [];

    // Populate candidates user info
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

    // 4. Fallback up to 80 users to support pagination
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

    // 5. Apply pagination slicing
    const skip = (page - 1) * limit;
    const paginatedSuggestions = suggestions.slice(skip, skip + limit);

    return {
      suggestions: paginatedSuggestions,
      totalPages: Math.ceil(suggestions.length / limit),
      currentPage: page,
      totalSuggestions: suggestions.length
    };
  } catch (err) {
    throw err;
  }
};
