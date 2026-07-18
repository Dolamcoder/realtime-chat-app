import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import MessageSearchPanel from "./MessageSearchPanel";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
    showSearch,
    messages,
  } = useChatStore();
  const selectedConvo =
    conversations.find((c) => c._id === activeConversationId) ?? null;
  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }
  const hasMessages = messages[selectedConvo._id]?.items?.length > 0;
  if (loading && !hasMessages) return <ChatWindowSkeleton />;
  return (
    <SidebarInset className="flex h-full flex-1 overflow-hidden rounded-sm shadow-md">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatWindowHeader chat={selectedConvo} />
        {/* Body */}
        <div className="flex-1 bg-primary-foreground overflow-hidden flex flex-col">
          <ChatWindowBody />
        </div>
        <MessageInput selectedConvo={selectedConvo} />
      </div>
      {showSearch && <MessageSearchPanel />}
    </SidebarInset>
  );
};
export default ChatWindowLayout;
