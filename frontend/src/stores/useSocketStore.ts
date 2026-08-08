import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import type { SocketState } from "@/types/store";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { useCallStore } from "./useCallStore";
import { useNotificationStore } from "./useNotificationStore";
import { useFriendStore } from "./useFriendStore";

const socketURL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    onlineUsers: [],
    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;
        if (existingSocket) return;
        const socket: Socket = io(socketURL, {
            auth: { token: accessToken },
            transports: ["websocket"]
        })
        set({ socket });
        socket.on("connect", () => {
            useNotificationStore.getState().fetchNotifications();
        });
        socket.on("online-users", (userIds) => {
            set({ onlineUsers: userIds });
        });
        socket.on("new-message", ({ message, conversation, unreadCounts }) => {
            const currentUserId = useAuthStore.getState().user?._id;
            const isOwn = message.senderId === currentUserId;

            if (isOwn) return;

            const { addMessage, updateConversation, activeConversationId, markSeen } = useChatStore.getState();
            addMessage(message);
            const lastMessage = {
                _id: conversation.lastMessage._id,
                content: conversation.lastMessage.content,
                createdAt: conversation.lastMessage.createdAt,
                sender: {
                    _id: conversation.lastMessage.senderId,
                    displayName: "",
                    avatarUrl: null,
                },
            };
            const updatedConversation = {
                ...conversation,
                lastMessage,
                unreadCounts,
            };
            updateConversation(updatedConversation);

            if (message.conversationId === activeConversationId) {
                markSeen(message.conversationId);
            }
        });
        socket.on("read-message", ({ conversation }) => {
            const { updateConversation } = useChatStore.getState();
            updateConversation(conversation);
        });
        socket.on("incoming-call", (data) => {
            useCallStore.getState().handleIncomingCall(data);
        });
        socket.on("call-accepted", (data) => {
            useCallStore.getState().handleCallAccepted(data);
        });
        socket.on("ice-candidate", (data) => {
            useCallStore.getState().handleIceCandidate(data);
        });
        socket.on("call-rejected", () => {
            useCallStore.getState().handleCallRejected();
        });
        socket.on("call-ended", () => {
            useCallStore.getState().handleCallEnded();
        });
        socket.on("new-notification", (data) => {
            useNotificationStore.getState().addNotification(data);
        });
        socket.on("friend-request-received", (data) => {
            useFriendStore.getState().addReceivedRequest(data);
        });
        socket.on("friend-request-accepted", (data) => {
            useFriendStore.getState().handleRequestAccepted(data);
        });
        socket.on("friend-request-deleted", (data) => {
            useFriendStore.getState().handleRequestDeleted(data);
        });
        socket.on("group-deleted", ({ conversationId }) => {
            useChatStore.setState((state) => {
                const updatedConversations = state.conversations.map((c) => {
                    if (c._id === conversationId) {
                        return { ...c, isDeleted: true };
                    }
                    return c;
                });
                return {
                    conversations: updatedConversations,
                };
            });
        });
        socket.on("group-updated", ({ conversation }) => {
            const { updateConversation } = useChatStore.getState();
            updateConversation(conversation);
        });
        socket.on("group-removed", ({ conversationId }) => {
            const { activeConversationId } = useChatStore.getState();
            useChatStore.setState((state) => {
                const updatedConversations = state.conversations.filter((c) => c._id !== conversationId);
                const updatedMessages = { ...state.messages };
                delete updatedMessages[conversationId];
                return {
                    conversations: updatedConversations,
                    messages: updatedMessages,
                    activeConversationId: activeConversationId === conversationId ? null : activeConversationId,
                };
            });
        });
        socket.on("message-recalled", ({ messageId, conversationId, lastMessage }) => {
            useChatStore.setState((state) => {
                const convoMessages = state.messages[conversationId]?.items || [];
                const updatedItems = convoMessages.map((m) =>
                    m._id === messageId
                        ? {
                              ...m,
                              content: "Tin nhắn đã bị thu hồi",
                              isRecalled: true,
                              imgUrls: [],
                              fileUrl: null,
                              fileName: null,
                              fileType: null,
                              voiceUrl: null,
                              voiceDuration: null,
                          }
                        : m
                );

                const updatedConversations = state.conversations.map((c) => {
                    if (c._id === conversationId && lastMessage) {
                        return { ...c, lastMessage };
                    }
                    return c;
                });

                return {
                    messages: {
                        ...state.messages,
                        [conversationId]: {
                            ...state.messages[conversationId],
                            items: updatedItems,
                        },
                    },
                    conversations: updatedConversations,
                };
            });
        });
        socket.on("new-conversation", ({ conversation, conversationId }) => {
            socket.emit("join-conversation", { conversationId });
            useChatStore.setState((state) => {
                const exists = state.conversations.some((c) => c._id === conversation._id);
                if (exists) return state;
                return {
                    conversations: [conversation, ...state.conversations],
                };
            });
        });
        socket.on("connect_error", (err) => {
            console.error(err);
        });
    },
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },
}))