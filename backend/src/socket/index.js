import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getConversationIdForSocketIO } from "../services/conversationService.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
})
io.use(socketAuthMiddleware);
// Map<userId, Set<socketId>> — hỗ trợ nhiều thiết bị cùng lúc
const onlineUsers = new Map();
io.on("connection", async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    // Thêm socketId vào Set của user (tạo mới nếu chưa có)
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(`${user.displayName} online with: ${socket.id} (${onlineUsers.get(userId).size} device(s))`);
    const conversationIds = await getConversationIdForSocketIO(user._id);
    conversationIds.forEach(id => {
        socket.join(id)
    })

    // Helper: lấy 1 socketId bất kỳ của 1 userId (dùng cho call)
    const getAnySocket = (targetUserId) => {
        const sockets = onlineUsers.get(targetUserId?.toString());
        if (!sockets || sockets.size === 0) return null;
        return sockets.values().next().value;
    };

    socket.on("call-user", ({ to, offer, callerName, callerAvatar }) => {
        const toStr = to?.toString();
        const receiverSocket = getAnySocket(toStr);
        console.log("Receive call-user");
        console.log("from:", userId);
        console.log("to (raw):", to, "| to (string):", toStr);
        console.log("onlineUsers:", Array.from(onlineUsers.entries()).map(([k, v]) => [k, Array.from(v)]));
        console.log("receiverSocket:", receiverSocket);
        if (receiverSocket) {
            console.log("Emit call-user 2", {
                from: user._id,
                offer,
                callerName,
                callerAvatar
            });
            io.to(receiverSocket).emit("incoming-call", {
                from: user._id,
                offer,
                callerName,
                callerAvatar
            });
        }
    });

    socket.on("call-accepted", ({ to, answer }) => {
        const callerSocket = getAnySocket(to);
        if (callerSocket) {
            io.to(callerSocket).emit("call-accepted", {
                answer,
                from: user._id
            });
        }
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        const targetSocket = getAnySocket(to);
        if (targetSocket) {
            io.to(targetSocket).emit("ice-candidate", {
                candidate,
                from: user._id
            });
        }
    });

    socket.on("reject-call", ({ to }) => {
        const targetSocket = getAnySocket(to);
        if (targetSocket) {
            io.to(targetSocket).emit("call-rejected");
        }
    });

    socket.on("end-call", ({ to }) => {
        const targetSocket = getAnySocket(to);
        if (targetSocket) {
            io.to(targetSocket).emit("call-ended");
        }
    });

    socket.on("disconnect", () => {
        const sockets = onlineUsers.get(userId);
        if (sockets) {
            sockets.delete(socket.id);
            // Chỉ xóa user khỏi online list khi KHÔNG còn thiết bị nào
            if (sockets.size === 0) {
                onlineUsers.delete(userId);
            }
        }
        io.emit("online-users", Array.from(onlineUsers.keys()));
        console.log(`${socket.id} disconnect (${onlineUsers.get(userId)?.size ?? 0} device(s) remaining)`)
    })
})
export { io, app, server };