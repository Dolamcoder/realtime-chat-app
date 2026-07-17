import { useEffect, useState } from "react";
import { useFriendStore } from "@/stores/useFriendStore";
import { SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { Search, UserPlus, UserCheck, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import UserAvatar from "../user/UserAvatar";
import { Link } from "react-router";

const FriendSuggestions = () => {
  const {
    suggestions,
    suggestionsPage,
    suggestionsTotalPages,
    friends,
    sentRequests,
    receivedRequests,
    searchResults,
    loading,
    fetchSuggestions,
    fetchFriends,
    fetchRequests,
    sendFriendRequest,
    acceptFriendRequest,
    searchUsers,
  } = useFriendStore();

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUserName, setTargetUserName] = useState("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    fetchSuggestions(1, 8);
    fetchFriends();
    fetchRequests();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    searchUsers(val);
  };

  const getRelation = (userId: string) => {
    if (friends.some((f) => f._id === userId)) return "friend";
    if (sentRequests.some((r) => r.to?._id === userId || r.to === userId)) return "sent";
    if (receivedRequests.some((r) => r.from?._id === userId || r.from === userId)) return "received";
    return "none";
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= suggestionsTotalPages) {
      fetchSuggestions(newPage, 8);
    }
  };

  const renderUserActionButton = (usr: any) => {
    const relation = getRelation(usr._id);
    const incomingReq = receivedRequests.find((r) => r.from?._id === usr._id);

    if (relation === "friend") {
      return (
        <span className="flex items-center justify-center gap-1 text-xs font-semibold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 w-full">
          <UserCheck className="w-3.5 h-3.5" />
          Bạn bè
        </span>
      );
    }

    if (relation === "sent") {
      return (
        <span className="flex items-center justify-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 w-full">
          <Clock className="w-3.5 h-3.5" />
          Đã gửi
        </span>
      );
    }

    if (relation === "received") {
      return (
        <button
          onClick={() => incomingReq && acceptFriendRequest(incomingReq._id)}
          className="flex items-center justify-center gap-1 text-xs font-bold text-white bg-primary hover:bg-primary/95 active:scale-95 px-4 py-1.5 rounded-full transition-all duration-200 w-full"
        >
          Phản hồi
        </button>
      );
    }

    return (
      <button
        onClick={() => {
          setTargetUserId(usr._id);
          setTargetUserName(usr.displayName);
          setMessageText("Chào bạn, mình kết bạn nhé!");
          setModalOpen(true);
        }}
        className="flex items-center justify-center gap-1 text-xs font-bold text-white bg-primary hover:bg-primary/95 active:scale-95 px-4 py-2 rounded-full transition-all duration-200 w-full"
      >
        <UserPlus className="w-3.5 h-3.5" />
        Kết bạn
      </button>
    );
  };

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md bg-background">
      <header className="sticky top-0 z-10 px-6 py-4 border-b border-border/40 flex items-center bg-background/95 backdrop-blur-md justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-foreground shrink-0 md:hidden" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Tìm kiếm & Gợi ý kết bạn
            </h2>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              Tìm kiếm bạn bè mới và khám phá những người bạn có thể biết
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 beautiful-scrollbar">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc username..."
            value={query}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/65 hover:bg-muted/95 focus:bg-background border border-border/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 outline-none text-foreground"
          />
        </div>

        {/* Search Results */}
        {query.trim().length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Kết quả tìm kiếm ({searchResults.length})
            </h3>
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không tìm thấy người dùng phù hợp.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {searchResults.map((usr) => {
                  return (
                    <div
                      key={usr._id}
                      className="flex flex-col items-center text-center p-5 bg-muted/20 border border-border/30 rounded-2xl hover:border-border/80 transition-all duration-200 justify-between min-h-[220px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-border/40 shadow-md">
                          <UserAvatar
                            type="sidebar"
                            name={usr.displayName}
                            avatarUrl={usr.avatarUrl}
                            className="!w-full !h-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-sm leading-tight">
                            {usr.displayName}
                          </h4>
                        </div>
                      </div>
                      <div className="mt-2 w-full">
                        {renderUserActionButton(usr)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Suggestions list */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            Những người bạn có thể biết
          </h3>

          {loading && suggestions.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted/30 border border-border/20 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Hiện tại không có gợi ý kết bạn mới.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {suggestions.map((usr) => {
                  return (
                    <div
                      key={usr._id}
                      className="flex flex-col items-center text-center p-5 bg-background border border-border/30 hover:border-border/80 rounded-2xl hover:shadow-md transition-all duration-200 justify-between min-h-[220px]"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-full overflow-hidden border border-border/40 shadow-sm">
                          <UserAvatar
                            type="sidebar"
                            name={usr.displayName}
                            avatarUrl={usr.avatarUrl}
                            className="!w-full !h-full"
                          />
                        </div>

                        <div className="mt-1 text-center">
                          <h4 className="font-bold text-sm leading-tight">
                            {usr.displayName}
                          </h4>

                          {usr.mutualCount > 0 && (
                            <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              {usr.mutualCount} bạn chung
                            </span>
                          )}
                        </div>

                        <div className="mt-2 w-full">
                          {renderUserActionButton(usr)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {suggestionsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 border-t border-border/40 pt-4">
                  <button
                    onClick={() => handlePageChange(suggestionsPage - 1)}
                    disabled={suggestionsPage === 1}
                    className="p-2 bg-muted hover:bg-muted-foreground/20 disabled:opacity-50 text-foreground rounded-lg transition-colors duration-200"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-foreground">
                    Trang {suggestionsPage} / {suggestionsTotalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(suggestionsPage + 1)}
                    disabled={suggestionsPage === suggestionsTotalPages}
                    className="p-2 bg-muted hover:bg-muted-foreground/20 disabled:opacity-50 text-foreground rounded-lg transition-colors duration-200"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog for Friend Request Message */}
      {modalOpen && targetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-background border border-border/40 w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col gap-4 animate-scale-in">
            <div>
              <h3 className="text-lg font-bold text-foreground">Gửi lời mời kết bạn</h3>
              <p className="text-xs text-muted-foreground mt-1">Gửi lời nhắn giới thiệu tới {targetUserName}</p>
            </div>
            <textarea
              placeholder="Nhập lời nhắn kết bạn..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full min-h-[100px] text-sm p-3 bg-muted border border-border/40 rounded-xl outline-none text-foreground resize-none focus:border-primary/50"
              autoFocus
            />
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setTargetUserId(null);
                }}
                className="flex-1 sm:flex-initial text-sm font-semibold px-5 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-foreground hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (targetUserId) {
                    sendFriendRequest(targetUserId, messageText);
                  }
                  setModalOpen(false);
                  setTargetUserId(null);
                }}
                className="flex-1 sm:flex-initial text-sm font-bold px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white shadow-lg hover:shadow-primary/20 transition-all"
              >
                Gửi lời mời
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarInset>
  );
};

export default FriendSuggestions;
