import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import { Phone, Video } from "lucide-react";
import { useCallStore } from "@/stores/useCallStore";
import { toast } from "sonner";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const { user } = useAuthStore();
  let otherUser;
  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;

    if (!user || !otherUser) return;
  }

  return (
    <header className="sticky top-0 z-10 px-4 py-0 flex items-center bg-background">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <div className="mx-3 h-7 w-[2px] rounded-full bg-black/20 dark:bg-white/20" />{" "}
        <div className="p-2 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* avatar */}
            <div className="relative">
              {chat.type === "direct" ? (
                <>
                  <UserAvatar
                    type={"sidebar"}
                    name={otherUser?.displayName || "Moji"}
                    avatarUrl={otherUser?.avatarUrl || undefined}
                  />
                  {/* todo: socket io */}
                  <StatusBadge status={onlineUsers.includes(otherUser?._id ?? "") ? "online" : "offline"} />
                </>
              ) : (
                <GroupChatAvatar
                  participants={chat.participants}
                  type="sidebar"
                />
              )}
            </div>

            {/* name */}
            <h2 className="font-semibold text-foreground">
              {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
            </h2>
          </div>

          {chat.type === "direct" && otherUser && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const isOnline = onlineUsers.includes(otherUser?._id ?? "");
                  if (!isOnline) {
                    toast.error(`${otherUser.displayName} đang ngoại tuyến. Hãy thử gọi lại sau.`);
                    return;
                  }
                  useCallStore.getState().startCall(
                    otherUser._id,
                    otherUser.displayName || "",
                    otherUser.avatarUrl || "",
                    "video"
                  );
                }}
                className="p-2 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200"
                title="Gọi Video"
              >
                <Video className="w-5 h-5 text-primary" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const isOnline = onlineUsers.includes(otherUser?._id ?? "");
                  if (!isOnline) {
                    toast.error(`${otherUser.displayName} đang ngoại tuyến. Hãy thử gọi lại sau.`);
                    return;
                  }
                  useCallStore.getState().startCall(
                    otherUser._id,
                    otherUser.displayName || "",
                    otherUser.avatarUrl || "",
                    "audio"
                  );
                }}
                className="p-2 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200"
                title="Gọi thường"
              >
                <Phone className="w-5 h-5 text-primary" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
