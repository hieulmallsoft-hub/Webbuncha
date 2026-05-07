import { create } from "zustand";
import { notificationsService } from "../services/notificationsService.js";

const sortByNewest = (items) =>
  [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

const upsertNotification = (items, notification) => {
  if (!notification?.id) {
    return items;
  }
  const exists = items.some((item) => item.id === notification.id);
  const next = exists
    ? items.map((item) => (item.id === notification.id ? notification : item))
    : [notification, ...items];
  return sortByNewest(next);
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: "",
  connected: false,
  unsubscribeStream: null,

  unreadCount: () => get().notifications.filter((item) => item.status === "UNREAD").length,

  load: async () => {
    set({ loading: true, error: "" });
    const res = await notificationsService.list();
    if (res.ok) {
      set({ notifications: sortByNewest(res.data), loading: false });
      return res;
    }
    set({ loading: false, error: res.error || "Khong the tai thong bao." });
    return res;
  },

  addRealtime: (notification) => {
    set((state) => ({
      notifications: upsertNotification(state.notifications, notification)
    }));
  },

  startStream: () => {
    const current = get().unsubscribeStream;
    if (current) {
      return current;
    }

    const unsubscribe = notificationsService.subscribe((notification) => {
      get().addRealtime(notification);
    });
    set({ unsubscribeStream: unsubscribe, connected: true });
    return unsubscribe;
  },

  stopStream: () => {
    const current = get().unsubscribeStream;
    if (current) {
      current();
    }
    set({ unsubscribeStream: null, connected: false });
  },

  markAsRead: async (id) => {
    const res = await notificationsService.markAsRead(id);
    if (res.ok && res.data) {
      set((state) => ({
        notifications: upsertNotification(state.notifications, res.data)
      }));
    }
    return res;
  },

  markAllAsRead: async () => {
    const res = await notificationsService.markAllAsRead();
    if (res.ok) {
      set({ notifications: sortByNewest(res.data) });
    }
    return res;
  },

  remove: async (id) => {
    const res = await notificationsService.remove(id);
    if (res.ok) {
      set((state) => ({
        notifications: state.notifications.filter((item) => item.id !== id)
      }));
    }
    return res;
  }
}));
