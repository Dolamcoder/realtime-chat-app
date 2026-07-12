import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import UnreadCountBadge from "./unreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages, fetchMessages, markSeen } = useChatStore();

  if (!user) return null;
  const lastMessage = convo.lastMessage?.content ?? "";

  const unreadCount = convo.unreadCounts[user._id];
  const name = convo.group?.name ?? "";
  const handleSelectConversation = async (convoId: string) => {
    setActiveConversation(convoId);
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
        <p className="text-sm truncate text-muted-foreground">
          {lastMessage ? lastMessage : convo.participants.map(p => p.displayName).join(", ")}
        </p>
      }
    />
  );
};

export default GroupChatCard;