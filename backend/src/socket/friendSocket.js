import { emitToUser } from "./index.js";

export const emitFriendRequestReceived = (userId, request) => {
  emitToUser(userId, "friend-request-received", request);
};

export const emitFriendRequestAccepted = (userId, data) => {
  emitToUser(userId, "friend-request-accepted", data);
};

export const emitFriendRequestDeleted = (userId, data) => {
  emitToUser(userId, "friend-request-deleted", data);
};
