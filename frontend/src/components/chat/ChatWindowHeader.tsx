import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import UserAvatar from "../user/UserAvatar";
import StatusBadge from "../user/StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import { Phone, Video, Search } from "lucide-react";
import { useCallStore } from "@/stores/useCallStore";
import { toast } from "sonner";
import GroupMembersModal from "./GroupMembersModal";
import { cn } from "@/lib/utils";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId, showSearch, setShowSearch } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const { user } = useAuthStore();
  let otherUser;
  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  const isRemoved = chat?.removedUsers?.includes(user?._id ?? "");

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
    <header className="sticky top-0 z-10 px-2 py-0 flex items-center bg-background border-b border-border/20">
      <div className="flex items-center gap-1 w-full">
        <SidebarTrigger className="-ml-1 text-foreground shrink-0" />
        <div className="mx-1 h-7 w-[1px] rounded-full bg-black/10 dark:bg-white/10 shrink-0" />{" "}
        <div className="p-1 w-full flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-hidden shrink-0">
            {/* avatar */}
            <div className="relative shrink-0">
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

            {/* name - giới hạn động: chat thường 18 ký tự (max-w-[180px]), nhóm 10 ký tự (max-w-[100px]) */}
            <h2 
              className={cn(
                "font-semibold text-foreground truncate sm:max-w-[200px] md:max-w-xs",
                chat.type === "direct" ? "max-w-[180px]" : "max-w-[100px]"
              )} 
              title={chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
            >
              {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
            </h2>
          </div>

          {chat.type === "direct" && otherUser ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  "p-2 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200",
                  showSearch && "bg-primary/10 text-primary"
                )}
                title="Tìm kiếm tin nhắn"
              >
                <Search className="w-5 h-5 text-primary" />
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
          ) : (
            chat.type === "group" && (
              <div className="flex items-center gap-1">
                {!isRemoved && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSearch(!showSearch)}
                      className={cn(
                        "p-2 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200",
                        showSearch && "bg-primary/10 text-primary"
                      )}
                      title="Tìm kiếm tin nhắn"
                    >
                      <Search className="w-5 h-5 text-primary" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info("Tính năng cuộc gọi nhóm đang được phát triển")}
                      className="p-2 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200"
                      title="Gọi Video Nhóm"
                    >
                      <Video className="w-5 h-5 text-primary" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info("Tính năng cuộc gọi nhóm đang được phát triển")}
                      className="p-2 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200"
                      title="Gọi thường Nhóm"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                    </button>
                    <GroupMembersModal chat={chat} />
                  </>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
