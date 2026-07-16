import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import type { SocketState } from "@/types/store";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { useCallStore } from "./useCallStore";

const socketURL = import.meta.env.VITE_SOCKET_URL;
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
            console.log("connect socket success");
        });
        socket.on("online-users", (userIds) => {
            set({ onlineUsers: userIds });
        });
        socket.on("new-message", ({ message, conversation, unreadCounts }) => {
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

            const currentUserId = useAuthStore.getState().user?._id;
            if (message.conversationId === activeConversationId && message.senderId !== currentUserId) {
                markSeen(message.conversationId);
            }
        });
        socket.on("read-message", ({ conversation }) => {
            const { updateConversation } = useChatStore.getState();
            updateConversation(conversation);
        });
        socket.on("incoming-call", (data) => {
            console.log("<<<<<incoming-call>>>>>", data);
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
        socket.on("connect_error", (err) => {
            console.log("<<<<err>>>>", err);
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