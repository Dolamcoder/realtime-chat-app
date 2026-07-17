import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import UserAvatar from "../user/UserAvatar";
import StatusBadge from "../user/StatusBadge";
import UnreadCountBadge from "./unreadCountBadge";
import { useSocketStore } from "@/stores/useSocketStore";

import { useNavigate } from "react-router";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages, fetchMessages, markSeen } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const navigate = useNavigate();

  if (!user) return;
  const otherUser = convo.participants.find((p) => p._id !== user._id);
  if (!otherUser) return;
  const unreadCount = convo.unreadCounts[user._id];
  const lastMessage = convo.lastMessage?.content ?? "";
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
      name={otherUser.displayName ?? ""}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      leftSection={
        <>
          <UserAvatar
            type="sidebar"
            name={otherUser.displayName ?? ""}
            avatarUrl={otherUser.avatarUrl ?? undefined}
          />
          <StatusBadge status={onlineUsers.includes(otherUser?._id ?? "") ? "online" : "offline"} />
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
        </>
      }
      subtitle={
        <p
          className={cn(
            "text-sm truncate",
            unreadCount > 0
              ? "font-medium text-black"
              : "text-black",
          )}
        >
          {lastMessage}
        </p>
      }
    />
  );
};
export default DirectMessageCard;
