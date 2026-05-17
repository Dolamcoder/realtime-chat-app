import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import {connectDB} from './src/config/db.js'
import { errorHandler } from './src/middlewares/errorHandle.js'
import router from "./src/routes/v1/index.js"
dotenv.config()
const app=express();
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1", router)
app.get("/", (req, res) => {
    res.json("hello world")
})
app.use(errorHandler)
const PORT=process.env.PORT || 3000
const HOST=process.env.HOST || 'localhost'
connectDB().then(()=>{
    app.listen(PORT, ()=>{
    console.log(`server start http://${HOST}:${PORT}`)})
})
