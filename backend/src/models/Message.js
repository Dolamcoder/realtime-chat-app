import mongoose from 'mongoose';
const messageSchema=new mongoose.Schema({
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
        required:true,
        index:true
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    content:{
        type:String,
        trim:true
    },
    isSystem:{
        type:Boolean,
        default:false
    },
    imgUrl:{
        type:String
    },
    imgUrls:{
        type:[String],
        default:[]
    },
    fileUrl: {
        type: String,
        default: null
    },
    fileName: {
        type: String,
        default: null
    },
    fileType: {
        type: String,
        default: null
    },
    voiceUrl: {
        type: String,
        default: null
    },
    voiceDuration: {
        type: Number,
        default: null
    },
},{timestamps:true});
messageSchema.index({conversationId:1, createdAt:-1});
const Message=mongoose.model("Message", messageSchema);
export default Message;