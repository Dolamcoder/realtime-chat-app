import { useState, useEffect } from "react";
import { Menu, Search, Check, Trash2, UserPlus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useFriendStore } from "@/stores/useFriendStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import UserAvatar from "../user/UserAvatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

const GroupMembersModal = ({ chat }: { chat: Conversation }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { friends, fetchFriends } = useFriendStore();
  const { addMembers, removeMember } = useChatStore();
  const { user } = useAuthStore();

  const isCreator = chat.group?.createdBy === user?._id || chat.group?.createBy === user?._id;

  useEffect(() => {
    if (open) {
      fetchFriends();
    } else {
      setSearchQuery("");
      setSelectedFriends([]);
      setActiveTab("list");
    }
  }, [open, fetchFriends]);

  // Lọc danh sách thành viên hiện tại của nhóm
  const filteredParticipants = chat.participants.filter((p) => {
    const query = searchQuery.toLowerCase();
    return p.displayName?.toLowerCase().includes(query);
  });

  // Lọc danh sách bạn bè CHƯA có trong nhóm để hiển thị trong tab thêm
  const availableFriends = friends.filter((friend) => {
    const isAlreadyMember = chat.participants.some((p) => p._id === friend._id);
    if (isAlreadyMember) return false;

    const query = searchQuery.toLowerCase();
    return (
      friend.displayName?.toLowerCase().includes(query) ||
      friend.username?.toLowerCase().includes(query)
    );
  });

  const toggleSelectFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) return;
    setLoading(true);
    try {
      await addMembers(chat._id, selectedFriends);
      setSelectedFriends([]);
      setActiveTab("list");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?")) {
      try {
        await removeMember(chat._id, memberId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200"
          title="Quản lý thành viên"
        >
          <Menu className="w-5 h-5 text-primary" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <Users className="size-5 text-primary" /> Quản lý nhóm
          </DialogTitle>
        </DialogHeader>

        {/* Tab Header */}
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => {
              setActiveTab("list");
              setSearchQuery("");
            }}
            className={cn(
              "flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-smooth",
              activeTab === "list"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Thành viên ({chat.participants.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("add");
              setSearchQuery("");
            }}
            className={cn(
              "flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-smooth",
              activeTab === "add"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Thêm thành viên
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === "list" ? "Tìm kiếm thành viên..." : "Tìm kiếm bạn bè..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[400px]">
          {activeTab === "list" ? (
            filteredParticipants.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không tìm thấy thành viên
              </div>
            ) : (
              filteredParticipants.map((member) => {
                const memberIsCreator =
                  chat.group?.createdBy === member._id || chat.group?.createBy === member._id;
                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 border border-transparent transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        type="sidebar"
                        name={member.displayName}
                        avatarUrl={member.avatarUrl ?? undefined}
                      />
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {member.displayName}
                          {memberIsCreator && (
                            <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                              Trưởng nhóm
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {isCreator && !memberIsCreator && member._id !== user?._id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-destructive hover:bg-destructive/10 size-8"
                        title="Xóa khỏi nhóm"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                );
              })
            )
          ) : (
            availableFriends.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Mọi người bạn đều đã có trong nhóm
              </div>
            ) : (
              availableFriends.map((friend) => {
                const isSelected = selectedFriends.includes(friend._id);
                return (
                  <div
                    key={friend._id}
                    onClick={() => toggleSelectFriend(friend._id)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 cursor-pointer border border-transparent transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        type="sidebar"
                        name={friend.displayName}
                        avatarUrl={friend.avatarUrl}
                      />
                      <div>
                        <p className="font-semibold text-sm text-foreground">{friend.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{friend.username}</p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "size-5 rounded-md border border-input flex items-center justify-center transition-smooth",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-background"
                      )}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Footer for Add Tab */}
        {activeTab === "add" && availableFriends.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={selectedFriends.length === 0 || loading}
              className="bg-gradient-primary text-white flex items-center gap-1.5"
            >
              <UserPlus className="size-4" /> {loading ? "Đang thêm..." : "Thêm vào nhóm"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersModal;
