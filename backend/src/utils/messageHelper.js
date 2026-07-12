export const updateConversationAfterCreateMessage=(conversation, message, senderId)=>{
    let previewContent = message.content;
    if (!previewContent) {
        if (message.imgUrls && message.imgUrls.length > 0) {
            previewContent = message.imgUrls.length === 1 ? "[Hình ảnh]" : `[${message.imgUrls.length} hình ảnh]`;
        } else if (message.fileUrl) {
            previewContent = `[Tệp tin] ${message.fileName || ""}`;
        } else if (message.voiceUrl) {
            previewContent = "[Tin nhắn thoại]";
        }
    }
    conversation.set({
        seenBy:[],
        lastMessageAt: message.createdAt,
        lastMessage:{
            _id: message._id,
            content: previewContent,
            senderId, 
            createdAt: message.createdAt,
        },
    });
    conversation.participants.forEach((p)=>{
        const memberId=p.userId.toString();
        const isSender=memberId===senderId.toString();
        const prevCount=conversation.unreadCounts.get(memberId) || 0;
        conversation.unreadCounts.set(memberId, isSender ?0:prevCount+1);
    })
}
