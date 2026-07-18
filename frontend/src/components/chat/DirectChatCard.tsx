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

import { useSidebar } from "../ui/sidebar";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages, fetchMessages, markSeen, clearConversation } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  if (!user) return;
  const otherUser = convo.participants.find((p) => p._id !== user._id);
  if (!otherUser) return;
  const unreadCount = convo.unreadCounts[user._id];
  const lastMessage = convo.lastMessage?.content ?? "";
  const handleSelectConversation = async (convoId: string) => {
    setActiveConversation(convoId);
    navigate("/");
    if (isMobile) {
      setOpenMobile(false);
    }
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
      onClearHistory={() => clearConversation(convo._id)}
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
              ? "font-semibold text-foreground"
              : "text-muted-foreground",
            lastMessage === "Dữ liệu cũ đã bị xóa" && "italic text-xs opacity-75"
          )}
        >
          {lastMessage}
        </p>
      }
    />
  );
};
export default DirectMessageCard;
