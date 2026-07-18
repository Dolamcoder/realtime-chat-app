import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { MessageCircle, Search } from "lucide-react";
import { useFriendStore } from "@/stores/useFriendStore";
import { useChatStore } from "@/stores/useChatStore";
import UserAvatar from "../user/UserAvatar";
import api from "@/lib/axios";
import { useNavigate } from "react-router";
import { useSidebar } from "../ui/sidebar";

const CreateNewChat = () => {
  const { friends, fetchFriends } = useFriendStore();
  const { conversations, fetchConversations, setActiveConversation } = useChatStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  const handleSelectFriend = async (friendId: string) => {
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
      setOpen(false);
      navigate("/");
      if (isMobile) {
        setOpenMobile(false);
      }
      
      // Sync list in background
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFriends = friends.filter((friend) => {
    const hasConvo = conversations.some(
      (c) => c.type === "direct" && c.participants.some((p) => p?._id === friend._id)
    );
    if (hasConvo) return false;

    return (
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex gap-2 w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card className="flex-1 p-3 glass hover:shadow-soft transition-smooth cursor-pointer group/card border border-border/20">
            <div className="flex items-center gap-4">
              <div className="size-8 bg-gradient-chat rounded-full flex items-center justify-center group-hover/card:scale-110 transition-bounce">
                <MessageCircle className="size-4 text-white" />
              </div>
              <span className="text-sm font-medium capitalize text-foreground">
                gửi tin nhắn mới
              </span>
            </div>
          </Card>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] rounded-2xl border border-border/40 bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Gửi tin nhắn mới
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input
              type="text"
              placeholder="Tìm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()} // Stop propagation to prevent global hotkey routing when typing
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/65 hover:bg-muted/95 focus:bg-background border border-border/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 outline-none text-foreground"
            />
          </div>

          {/* Friends list */}
          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2 beautiful-scrollbar">
            {filteredFriends.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Không tìm thấy bạn bè nào.
              </p>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  onClick={() => handleSelectFriend(friend._id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-border/30"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-border/40 shadow-sm flex-shrink-0">
                    <UserAvatar
                      type="sidebar"
                      name={friend.displayName}
                      avatarUrl={friend.avatarUrl}
                      className="!w-full !h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground text-sm leading-none truncate">
                      {friend.displayName}
                    </h4>
                    <span className="text-xs text-muted-foreground/75 mt-1 block truncate">
                      @{friend.username}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateNewChat;