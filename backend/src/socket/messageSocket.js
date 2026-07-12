export const emitNewMessage = async (io, conversation, message) => {
    console.log("socket send success");
    io.to(conversation._id.toString()).emit("new-message", {
        message,
        conversation: {
            _id: conversation._id.toString(),
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
        },
        unreadCounts: conversation.unreadCounts,
    })
}
export const readMessage = async (io, conversation) => {
    const convoId = conversation._id?.toString() || conversation._id;
    const lastMsgId = conversation.lastMessage?._id?.toString() || conversation.lastMessage?._id;
    const senderId = conversation.lastMessage?.senderId?._id?.toString() || conversation.lastMessage?.senderId?.toString();

    io.to(convoId).emit("read-message", {
        conversation,
        lastMessage: {
            _id: lastMsgId,
            content: conversation?.lastMessage?.content,
            createdAt: conversation?.lastMessage?.createdAt,
            sender: {
                _id: senderId,
            }
        },
    })
}