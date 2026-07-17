import api from "@/lib/axios";

export const notificationService = {
  async fetchNotifications() {
    const res = await api.get("/notifications");
    return res.data.notifications; // array
  },

  async markAsRead(id: string) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.notification;
  }
};
