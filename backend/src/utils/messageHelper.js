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

    const update = {
        $set: {
            seenBy: [],
            lastMessageAt: message.createdAt,
            lastMessage: {
                _id: message._id,
                content: previewContent,
                senderId,
                createdAt: message.createdAt,
            },
        },
        $inc: {},
    };

    conversation.participants.forEach((p) => {
        const memberId = p.userId.toString();
        const isSender = memberId === senderId.toString();

        if (isSender) {
            update.$set[`unreadCounts.${memberId}`] = 0;
        } else {
            update.$inc[`unreadCounts.${memberId}`] = 1;
        }
    });

    return update;
};