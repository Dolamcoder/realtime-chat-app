import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
})
io.use(socketAuthMiddleware);
const onlineUsers = new Map();
io.on("connection", async (socket) => {
    const user = socket.user;
    onlineUsers.set(user._id, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(`${user.displayName} online with: ${socket.id}`);
    socket.on("disconnect", () => {
        onlineUsers.delete(user._id);
        io.emit("online-users", Array.from(onlineUsers.keys()));
        console.log(`${socket.id} disconnect `)
    })
})
export { io, app, server };