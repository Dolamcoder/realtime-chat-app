import { useState, useEffect } from "react";
import { Users, Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { useFriendStore } from "@/stores/useFriendStore";
import { useChatStore } from "@/stores/useChatStore";
import UserAvatar from "../user/UserAvatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

const NewGroupChatModal = () => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { friends, fetchFriends } = useFriendStore();
  const { createGroupConversation } = useChatStore();

  useEffect(() => {
    if (open) {
      fetchFriends();
    } else {
      setGroupName("");
      setSearchQuery("");
      setSelectedMembers([]);
    }
  }, [open, fetchFriends]);

  const filteredFriends = friends.filter((friend) => {
    const query = searchQuery.toLowerCase();
    return (
      friend.displayName?.toLowerCase().includes(query) ||
      friend.username?.toLowerCase().includes(query)
    );
  });

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    if (selectedMembers.length === 0) return;

    setSubmitting(true);
    try {
      await createGroupConversation(groupName.trim(), selectedMembers);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center p-1 hover:bg-muted/50 rounded-md transition-smooth">
          <Users className="size-5 text-muted-foreground hover:text-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Tạo nhóm chat mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Group Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tên nhóm</label>
            <Input
              placeholder="Nhập tên nhóm chat..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Members Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Chọn thành viên ({selectedMembers.length})</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bạn bè..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Friends List Container */}
          <div className="border border-border rounded-lg max-h-60 overflow-y-auto divide-y divide-border">
            {filteredFriends.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Không tìm thấy bạn bè nào
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedMembers.includes(friend._id);
                return (
                  <div
                    key={friend._id}
                    onClick={() => toggleMember(friend._id)}
                    className="flex items-center justify-between p-3 hover:bg-muted/30 cursor-pointer transition-smooth"
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

                    <div className={cn(
                      "size-5 rounded-md border border-input flex items-center justify-center transition-smooth",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-background"
                    )}>
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0 || submitting}
            className="bg-gradient-primary text-white"
          >
            {submitting ? "Đang tạo..." : "Tạo nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatModal;