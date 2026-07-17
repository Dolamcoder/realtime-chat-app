import { useChatStore } from "@/stores/useChatStore";
import MessageItem from "./MessageItem";
import { useEffect, useRef } from "react";
const ChatWindowBody = () => {
  const {
    activeConversationId,
    messages: allMessages,
    conversations,
  } = useChatStore();
  console.log("<<< check message", allMessages);
  const messages = allMessages[activeConversationId!]?.items || [];
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );
  const reversedMessages = [...messages].reverse();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!messages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground ">
        Hãy bắt đầu gửi tin nhắn ngay bây giờ
      </div>
    );
  }
  console.log("<<<<<check", messages);
  return (
    <div className="p-4 pb-3 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div className="flex flex-col-reverse overflow-y-auto overflow-x-hidden no-scrollbar">
        <div ref={messagesEndRef} />
        {reversedMessages.map((message, index) => (
          <MessageItem
            key={message.tempId || message._id || index}
            message={message}
            index={index}
            messages={messages}
            selectedConvo={selectedConvo!}
            lastMessageStatus={
              selectedConvo!.seenBy && selectedConvo!.seenBy.length > 0
                ? "seen"
                : "delivered"
            }
          />
        ))}
      </div>
    </div>
  );
};
export default ChatWindowBody;
