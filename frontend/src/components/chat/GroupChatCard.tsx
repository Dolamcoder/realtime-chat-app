import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import UnreadCountBadge from "./unreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { cn } from "@/lib/utils";

import { useNavigate } from "react-router";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages, fetchMessages, markSeen, clearConversation, deleteGroup } = useChatStore();
  const navigate = useNavigate();

  if (!user) return null;
  const lastMessage = convo.lastMessage?.content ?? "";

  const unreadCount = convo.unreadCounts[user._id];
  const name = convo.group?.name ?? "";
  const isCreator = !convo.group?.createdBy && !convo.group?.createBy
    ? true // Fallback cho nhóm cũ chưa lưu thông tin người tạo để hiển thị nút Gỡ nhóm
    : convo.group?.createdBy === user._id || convo.group?.createBy === user._id;

  const handleSelectConversation = async (convoId: string) => {
    setActiveConversation(convoId);
    navigate("/");
    if (!messages[convoId]) {
      await fetchMessages(convoId);
    }
    await markSeen(convoId);
  };

  return (
    <ChatCard
      convoId={convo._id}
      name={name}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      onClearHistory={() => clearConversation(convo._id)}
      onDeleteGroup={isCreator ? () => deleteGroup(convo._id) : undefined}
      leftSection={
        <>
          <>
            {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
            <GroupChatAvatar
              participants={convo.participants}
              type="chat"
            />
          </>
        </>
      }
      subtitle={
        <p
          className={cn(
            "text-sm truncate text-muted-foreground",
            lastMessage === "Dữ liệu cũ đã bị xóa" && "italic text-xs opacity-75"
          )}
        >
          {lastMessage ? lastMessage : convo.participants.map(p => p.displayName).join(", ")}
        </p>
      }
    />
  );
};

export default GroupChatCard;