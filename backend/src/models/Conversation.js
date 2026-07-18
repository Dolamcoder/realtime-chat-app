import mongoose from "mongoose";
const participantSchema=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    joinAt: {
        type: Date,
        default: Date.now
    },
    clearedAt: {
        type: Date,
        default: null
    }
}, {_id: false});
const groupSchema=new mongoose.Schema({
    name: {
        type: String,
    },
    createBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {_id:false});
const lastMessageSchema=new mongoose.Schema({
    _id:{type: String},
    content:{
        type: String,
        default: null
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: null
    }
});
const conversationSchema=new mongoose.Schema({
    type:{
        type: String,
        enum: ["direct", "group", "mentor"],
        require: true,
    },
    participants:{
        type: [participantSchema],
        require: true,
    },
    group:{
        type: groupSchema,
    },
    lastMessageAt: {
        type: Date,
    },
    seenBy:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    lastMessage:{
        type: lastMessageSchema,
        default: null,
    },
    unreadCounts:{
        type: Map,
        of: Number,
        default:{},
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    removedUsers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})
conversationSchema.index({"participants.userId":1, lastMessageAt: -1});
export const Conversation=mongoose.model("Conversation", conversationSchema);