import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import FriendsList from "@/components/chat/FriendsList";
import FriendSuggestions from "@/components/chat/FriendSuggestions";
import NotificationsList from "@/components/chat/NotificationsList";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import CallOverlay from "@/components/chat/CallOverlay";

interface ChatAppPageProps {
  view?: "chat" | "friends" | "suggestions" | "notifications";
}

const ChatAppPage = ({ view = "chat" }: ChatAppPageProps) => {
  const renderMainView = () => {
    switch (view) {
      case "friends":
        return <FriendsList />;
      case "suggestions":
        return <FriendSuggestions />;
      case "notifications":
        return <NotificationsList />;
      case "chat":
      default:
        return <ChatWindowLayout />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex h-screen w-full sm:p-2">
        {renderMainView()}
      </div>
      <CallOverlay />
    </SidebarProvider>
  );
};

export default ChatAppPage;