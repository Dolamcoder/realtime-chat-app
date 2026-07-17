import { Friend } from "../models/Friend.js";
import {FriendRequest} from "../models/FriendRequest.js";
import ApiError from "../utils/ApiError.js";
export const sendRequest=async(from, to, message)=>{
    try{
        return await FriendRequest.create({
            from, to, message
        })
    }catch(err){throw err};
}
export const getRequestById=async(requestId)=>{
    try{
        const request=await FriendRequest.findById(requestId).lean();
        if(!request) throw new ApiError(404, "Không tìm thấy lời mời kết bạn");
        return request;
    }catch(err){throw err};
}
export const deleteRequest=async(requestId)=>{
    try{
        await FriendRequest.findByIdAndDelete(requestId);
    }catch(err){throw err};
}
export const getAllSentRequest=async(userId)=>{
    try{
        return await FriendRequest.find({from:userId}).populate("to", "_id username displayName avatarUrl");
    }catch(err){throw err};
}
export const getAllSReceivedRequest=async(userId)=>{
    try{
        return await FriendRequest.find({to:userId}).populate("from", "_id username displayName avatarUrl");
    }catch(err){throw err};
}
