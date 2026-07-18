export const updateConversationAfterCreateMessage = (conversation, message, senderId) => {
    let previewContent = message.content;

    if (!previewContent) {
        if (message.imgUrls && message.imgUrls.length > 0) {
            previewContent =
                message.imgUrls.length === 1
                    ? "[Hình ảnh]"
                    : `[${message.imgUrls.length} hình ảnh]`;
        } else if (message.fileUrl) {
            previewContent = `[Tệp tin] ${message.fileName || ""}`;
        } else if (message.voiceUrl) {
            previewContent = "[Tin nhắn thoại]";
        }
    }

    conversation.seenBy = [];
    conversation.lastMessageAt = message.createdAt;
    conversation.lastMessage = {
        _id: message._id.toString(),
        content: previewContent,
        senderId,
        createdAt: message.createdAt,
    };

    if (!conversation.unreadCounts) {
        conversation.unreadCounts = new Map();
    }

    conversation.participants.forEach((p) => {
        const memberId = p.userId.toString();
        const isSender = senderId ? memberId === senderId.toString() : false;

        if (isSender) {
            conversation.unreadCounts.set(memberId, 0);
        } else {
            const currentCount = conversation.unreadCounts.get(memberId) || 0;
            conversation.unreadCounts.set(memberId, currentCount + 1);
        }
    });

    conversation.markModified("lastMessage");
    conversation.markModified("unreadCounts");
    conversation.markModified("seenBy");
};