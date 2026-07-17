import { useEffect } from "react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useChatStore } from "@/stores/useChatStore";
import { SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { Bell, UserPlus, UserCheck, MessageSquare, ChevronLeft } from "lucide-react";
import UserAvatar from "../user/UserAvatar";
import { useNavigate, Link } from "react-router";

const NotificationsList = () => {
  const { notifications, loading, fetchNotifications, markAsRead } = useNotificationStore();
  const { conversations, setActiveConversation, fetchConversations } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification: any) => {
    // 1. Mark as read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // 2. Navigate based on type
    if (notification.type === "friend_request" || notification.type === "friend_accept") {
      navigate("/ban-be");
    } else if (notification.type === "new_message") {
      const convoId = notification.relatedId;
      if (convoId) {
        // Ensure conversation exists in store
        const existingConvo = conversations.find((c) => c._id === convoId);
        if (!existingConvo) {
          await fetchConversations();
        }
        setActiveConversation(convoId);
      }
      navigate("/");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return (
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case "friend_accept":
        return (
          <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
            <UserCheck className="w-4 h-4" />
          </div>
        );
      case "new_message":
      default:
        return (
          <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 border-b border-border/40 flex items-center justify-between bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-foreground shrink-0 md:hidden" />
          <Link
            to="/"
            className="p-2 hover:bg-muted rounded-full text-foreground/80 hover:text-foreground transition-colors duration-200"
            title="Quay lại đoạn chat"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="mx-1 h-6 w-[1px] bg-border md:hidden" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Thông báo của bạn
            </h2>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              Xem và quản lý tất cả các hoạt động, thông báo mới nhất
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 beautiful-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 border border-border/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground/80 space-y-3">
            <Bell className="w-10 h-10 text-muted-foreground/55 animate-bounce" />
            <p className="text-sm">Bạn chưa nhận được thông báo nào.</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  notification.isRead
                    ? "bg-background border-border/30 text-foreground/80 hover:border-border/60 hover:bg-muted/10"
                    : "bg-primary/5 border-primary/20 hover:border-primary/40 text-foreground font-medium hover:bg-primary/10 shadow-sm"
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug break-words">
                    {notification.content}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!notification.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarInset>
  );
};

export default NotificationsList;
