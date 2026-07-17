import api from "@/lib/axios";

export const friendService = {
  async fetchFriends() {
    const res = await api.get("/friends");
    return res.data.friends; // array
  },

  async fetchSuggestions(page: number = 1, limit: number = 8) {
    const res = await api.get(`/friends/suggestions?page=${page}&limit=${limit}`);
    return res.data; // { suggestions: Array, totalPages: number, currentPage: number }
  },

  async fetchRequests() {
    const res = await api.get("/friends/requests");
    return res.data; // { sent: Array, received: Array }
  },

  async sendRequest(toUserId: string, message: string = "") {
    const res = await api.post("/friends/requests", { to: toUserId, message });
    return res.data;
  },

  async acceptRequest(requestId: string) {
    const res = await api.post(`/friends/requests/${requestId}`);
    return res.data;
  },

  async rejectRequest(requestId: string) {
    const res = await api.delete(`/friends/requests/${requestId}`);
    return res.data;
  },

  async searchUsers(query: string) {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data.users; // array
  }
};
