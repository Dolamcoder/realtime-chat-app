import { create } from "zustand";
import { friendService } from "@/services/friendService";
import { toast } from "sonner";

interface FriendStore {
  friends: any[];
  suggestions: any[];
  sentRequests: any[];
  receivedRequests: any[];
  searchResults: any[];
  suggestionsPage: number;
  suggestionsTotalPages: number;
  loading: boolean;

  fetchFriends: () => Promise<void>;
  fetchSuggestions: (page?: number, limit?: number) => Promise<void>;
  fetchRequests: () => Promise<void>;
  sendFriendRequest: (toUserId: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
  friends: [],
  suggestions: [],
  suggestionsPage: 1,
  suggestionsTotalPages: 1,
  sentRequests: [],
  receivedRequests: [],
  searchResults: [],
  loading: false,

  fetchFriends: async () => {
    try {
      set({ loading: true });
      const friends = await friendService.fetchFriends();
      set({ friends });
    } catch (e: any) {
      console.error(e);
      toast.error("Không thể tải danh sách bạn bè");
    } finally {
      set({ loading: false });
    }
  },

  fetchSuggestions: async (page = 1, limit = 8) => {
    try {
      set({ loading: true });
      const data = await friendService.fetchSuggestions(page, limit);
      set({
        suggestions: data.suggestions || [],
        suggestionsPage: data.currentPage || 1,
        suggestionsTotalPages: data.totalPages || 1
      });
    } catch (e: any) {
      console.error(e);
      toast.error("Không thể tải gợi ý kết bạn");
    } finally {
      set({ loading: false });
    }
  },

  fetchRequests: async () => {
    try {
      set({ loading: true });
      const data = await friendService.fetchRequests();
      set({
        sentRequests: Array.isArray(data.sent) ? data.sent : [],
        receivedRequests: Array.isArray(data.received) ? data.received : []
      });
    } catch (e: any) {
      console.error(e);
      toast.error("Không thể tải yêu cầu kết bạn");
    } finally {
      set({ loading: false });
    }
  },

  sendFriendRequest: async (toUserId, message = "") => {
    try {
      await friendService.sendRequest(toUserId, message);
      toast.success("Đã gửi lời mời kết bạn");
      // Refresh requests to update state to 'sent'
      await get().fetchRequests();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Không thể gửi lời mời kết bạn");
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      await friendService.acceptRequest(requestId);
      toast.success("Đã kết bạn thành công!");
      // Refresh requests, friends
      await get().fetchRequests();
      await get().fetchFriends();
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi khi đồng ý kết bạn");
    }
  },

  rejectFriendRequest: async (requestId) => {
    try {
      await friendService.rejectRequest(requestId);
      toast.success("Đã từ chối lời mời kết bạn");
      // Refresh requests
      await get().fetchRequests();
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi khi từ chối lời mời kết bạn");
    }
  },

  cancelFriendRequest: async (requestId) => {
    try {
      await friendService.rejectRequest(requestId);
      toast.success("Đã hủy lời mời kết bạn");
      // Refresh requests
      await get().fetchRequests();
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi khi hủy lời mời kết bạn");
    }
  },

  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    try {
      set({ loading: true });
      const results = await friendService.searchUsers(query);
      set({ searchResults: results });
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi khi tìm kiếm người dùng");
    } finally {
      set({ loading: false });
    }
  }
}));
