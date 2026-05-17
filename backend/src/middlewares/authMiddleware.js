import { asyncHandler } from "../utils/asyncHandle";
import jwt from "jsonwebtoken";
import { getUserById } from "../services/userService";
export const protectedRoute=asyncHandler(async(req, res, next)=>{
    try{
        const authHeader=req.header["authorization"];
        const token=authHeader && authHeader.split("")[1];
        if(!token) return res.status(401).json({message: "Không tìm thấy token"});
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,async(err, decodedUser)=>{
        if(err){
            console.log(err);
            return res.status(403).json({mesage:"Access token hết hạn hoặc không đúng"})
        }
        const user=await getUserById(decodedUser.userId);
        req.user=user
        next();
    })
    }catch(e){res.status(500).json({message: "Lỗi hệ thống"});}
})  