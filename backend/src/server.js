import express from 'express'
import dotenv from 'dotenv'
import {connectDB} from './config/db.js'
dotenv.config()
const app=express();
app.use(express.json())
app.get("/", (req, res) => {
    res.json("hello world")
})
const PORT=process.env.PORT || 3000
const HOST=process.env.HOST || 'localhost'
connectDB().then(()=>{
    app.listen(PORT, ()=>{
    console.log(`server start http://${HOST}:${PORT}`)})
})
