import { useState, useEffect } from "react";
import { X, Search, Calendar, User } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { chatService } from "@/services/chatService";
import type { Message } from "@/types/chat";
import UserAvatar from "../user/UserAvatar";
import { formatMessageTime } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const MessageSearchPanel = () => {
  const { activeConversationId, setShowSearch } = useChatStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery("");
    setResults([]);
  }, [activeConversationId]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || !activeConversationId) return;

    setLoading(true);
    try {
      const res = await chatService.searchMessages(activeConversationId, query);
      setResults(res.messages || []);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tin nhắn:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt tìm kiếm khi gõ (tùy chọn: có thể dùng debounce hoặc chỉ tìm khi submit)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="fixed inset-y-0 right-0 z-50 md:relative w-full sm:w-80 md:w-72 h-full border-l border-border/40 bg-background flex flex-col overflow-hidden shrink-0 shadow-lg md:shadow-none">
      {/* Header */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Search className="size-4 text-primary" /> Tìm kiếm tin nhắn
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(false)}
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Input */}
      <form onSubmit={handleSearch} className="p-4 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Nhập từ khóa cần tìm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </form>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Đang tìm kiếm...
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {query.trim() ? "Không tìm thấy kết quả nào" : "Nhập từ khóa để bắt đầu tìm kiếm"}
          </div>
        ) : (
          results.map((msg) => {
            const senderName = typeof msg.senderId === "object" && msg.senderId 
              ? (msg.senderId as any).displayName 
              : "Thành viên";
            const avatarUrl = typeof msg.senderId === "object" && msg.senderId 
              ? (msg.senderId as any).avatarUrl 
              : undefined;

            return (
              <div
                key={msg._id}
                className="p-3 rounded-lg border border-border/30 hover:bg-muted/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      type="chat"
                      name={senderName}
                      avatarUrl={avatarUrl}
                      className="size-5"
                    />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {senderName}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatMessageTime(new Date(msg.createdAt))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground break-words line-clamp-2">
                  {msg.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessageSearchPanel;
