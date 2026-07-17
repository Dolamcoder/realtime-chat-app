import { useEffect, useState } from "react";
import { useFriendStore } from "@/stores/useFriendStore";
import { useChatStore } from "@/stores/useChatStore";
import { SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { Users, UserCheck, MessageSquare, Check, X, Clock, ChevronLeft } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { useNavigate, Link } from "react-router";
import api from "@/lib/axios";

const FriendsList = () => {
  const {
    friends,
    sentRequests,
    receivedRequests,
    loading,
    fetchFriends,
    fetchRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
  } = useFriendStore();

  const { conversations, fetchConversations, setActiveConversation } = useChatStore();
  const navigate = useNavigate();

  // Local state to keep items in list even after store is updated
  const [localReceived, setLocalReceived] = useState<any[]>([]);
  const [localSent, setLocalSent] = useState<any[]>([]);
  const [processed, setProcessed] = useState<Record<string, "accepted" | "rejected" | "cancelled">>({});

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  useEffect(() => {
    setLocalReceived((prev) => {
      const existingIds = new Set(prev.map((r) => r._id));
      const newItems = receivedRequests.filter((r) => !existingIds.has(r._id));
      return [...prev, ...newItems];
    });
  }, [receivedRequests]);

  useEffect(() => {
    setLocalSent((prev) => {
      const existingIds = new Set(prev.map((r) => r._id));
      const newItems = sentRequests.filter((r) => !existingIds.has(r._id));
      return [...prev, ...newItems];
    });
  }, [sentRequests]);

  const handleStartChat = async (friendId: string) => {
    try {
      const res = await api.post("/conversations", { memberIds: [friendId] });
      const convo = res.data.conversation;
      
      // Update local state directly so there is no delay
      useChatStore.setState((state) => {
        const exists = state.conversations.some((c) => c._id === convo._id);
        if (exists) return state;
        return { conversations: [convo, ...state.conversations] };
      });
      
      setActiveConversation(convo._id);
      navigate("/");
      
      // Sync list in background
      fetchConversations();
    } catch (err) {
      console.error("Lỗi khi bắt đầu cuộc trò chuyện:", err);
    }
  };

  const handleAccept = async (reqId: string) => {
    setProcessed((prev) => ({ ...prev, [reqId]: "accepted" }));
    await acceptFriendRequest(reqId);
  };

  const handleReject = async (reqId: string) => {
    setProcessed((prev) => ({ ...prev, [reqId]: "rejected" }));
    await rejectFriendRequest(reqId);
  };

  const handleCancel = async (reqId: string) => {
    setProcessed((prev) => ({ ...prev, [reqId]: "cancelled" }));
    await cancelFriendRequest(reqId);
  };

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 border-b border-border/40 flex items-center gap-3 bg-background/95 backdrop-blur-md justify-between">
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
              <Users className="w-5 h-5 text-primary" />
              Bạn bè & Lời mời
            </h2>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              Quản lý danh sách bạn bè và phản hồi lời mời
            </p>
          </div>
        </div>
      </header>

      {/* Body Layout */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 beautiful-scrollbar">

        {/* Column 1: Friends list */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/40 pb-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Bạn bè ({friends.length})
          </h3>

          {loading && friends.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/30 border border-border/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Chưa có bạn bè nào. Hãy vào mục gợi ý để kết bạn mới!</p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between p-3.5 bg-background border border-border/30 hover:border-border/80 hover:shadow-sm rounded-2xl transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border/40 shadow-sm">
                      <UserAvatar
                        type="sidebar"
                        name={friend.displayName}
                        avatarUrl={friend.avatarUrl}
                        className="!w-full !h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm leading-none">
                        {friend.displayName}
                      </h4>
                      <span className="text-xs text-muted-foreground/80 mt-1 block">@{friend.username}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(friend._id)}
                    className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-4 py-2 rounded-full transition-all duration-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Nhắn tin
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Requests list */}
        <div className="space-y-6">
          {/* Incoming invitations */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Clock className="w-4 h-4 text-primary" />
              Yêu cầu kết bạn nhận được ({receivedRequests.length})
            </h3>

            {localReceived.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Không có lời mời kết bạn nào.</p>
            ) : (
              <div className="space-y-3">
                {localReceived.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between p-3.5 bg-muted/15 border border-border/30 rounded-2xl hover:border-border/60 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-border/40 shadow-sm">
                        <UserAvatar
                          type="sidebar"
                          name={req.from?.displayName || "Moji"}
                          avatarUrl={req.from?.avatarUrl}
                          className="!w-full !h-full"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm leading-none">
                          {req.from?.displayName}
                        </h4>
                        <span className="text-xs text-muted-foreground/80 mt-1 block">@{req.from?.username}</span>
                        {req.message && (
                          <p className="text-xs bg-background/80 border border-border/20 px-2 py-1 rounded-md text-foreground/80 mt-1.5 italic max-w-[200px] truncate">
                            "{req.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      {processed[req._id] === "accepted" ? (
                        <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                          Đã chấp nhận
                        </span>
                      ) : processed[req._id] === "rejected" ? (
                        <span className="text-xs font-semibold text-zinc-500 bg-zinc-500/10 px-3 py-1.5 rounded-full border border-zinc-500/20">
                          Đã từ chối
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAccept(req._id)}
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-emerald-500/20"
                            title="Đồng ý"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            className="p-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-red-500/20"
                            title="Từ chối"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent invitations */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Lời mời đã gửi ({sentRequests.length})
            </h3>

            {localSent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Bạn không gửi lời mời nào gần đây.</p>
            ) : (
              <div className="space-y-3">
                {localSent.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between p-3 bg-background border border-border/30 rounded-2xl transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-border/40 shadow-sm">
                        <UserAvatar
                          type="sidebar"
                          name={req.to?.displayName || "Moji"}
                          avatarUrl={req.to?.avatarUrl}
                          className="!w-full !h-full"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm leading-none">
                          {req.to?.displayName}
                        </h4>
                        <span className="text-xs text-muted-foreground/80 mt-1 block">@{req.to?.username}</span>
                      </div>
                    </div>
                    <div>
                      {processed[req._id] === "cancelled" ? (
                        <span className="text-xs font-semibold text-zinc-500 bg-zinc-500/10 px-3 py-1.5 rounded-full border border-zinc-500/20">
                          Đã hủy
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCancel(req._id)}
                          className="text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-500/20 hover:border-red-500 px-3.5 py-1.5 rounded-full transition-all duration-200"
                        >
                          Hủy yêu cầu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </SidebarInset>
  );
};

export default FriendsList;
