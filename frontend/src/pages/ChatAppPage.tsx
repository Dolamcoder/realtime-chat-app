import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import CallOverlay from "@/components/chat/CallOverlay";

const ChatAppPage = () => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex h-screen w-full sm:p-2">
        <ChatWindowLayout />
      </div>
      <CallOverlay />
    </SidebarProvider>
  );
};

export default ChatAppPage;