import { create } from "zustand";
import { notificationService } from "@/services/notificationService";
import { toast } from "sonner";

interface NotificationState {
  notifications: any[];
  loading: boolean;
  unreadCount: number;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  addNotification: (notification: any) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const notifications = await notificationService.fetchNotifications();
      const unreadCount = notifications.filter((n: any) => !n.isRead).length;
      set({ notifications, unreadCount });
    } catch (e) {
      console.error(e);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      const updated = await notificationService.markAsRead(id);
      set((state) => {
        const index = state.notifications.findIndex((n) => n._id === id);
        if (index === -1) return {};
        const newNotifications = [...state.notifications];
        newNotifications[index] = { ...newNotifications[index], isRead: true };
        const unreadCount = newNotifications.filter((n: any) => !n.isRead).length;
        return { notifications: newNotifications, unreadCount };
      });
    } catch (e) {
      console.error(e);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      if (state.notifications.some((n) => n._id === notification._id)) {
        return {};
      }
      const newNotifications = [notification, ...state.notifications];
      const unreadCount = newNotifications.filter((n: any) => !n.isRead).length;
      
      toast.info(notification.content, {
        duration: 4000,
      });

      return { notifications: newNotifications, unreadCount };
    });
  },

  reset: () => {
    set({ notifications: [], unreadCount: 0, loading: false });
  }
}));
