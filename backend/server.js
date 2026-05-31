import dotenv from "dotenv";
import express from "express"
import cookieParser from 'cookie-parser'
import { connectDB } from './src/config/db.js'
import { errorHandler } from './src/middlewares/errorHandle.js'
import router from "./src/routes/v1/index.js"
import cors from "cors"
dotenv.config();
import { app, server } from "./src/socket/index.js";
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use("/api/v1", router)
app.get("/", (req, res) => {
    res.json("hello world")
})
app.use(errorHandler)
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`server start http://${HOST}:${PORT}`)
    })
})
