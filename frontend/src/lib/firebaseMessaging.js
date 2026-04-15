import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const PUBLIC_CONFIG_URL = `${API_BASE}/push/public-config`;
const TOKEN_STORAGE_KEY = "admin_push_token";

let publicConfigPromise;

const getPublicConfig = async () => {
  if (!publicConfigPromise) {
    publicConfigPromise = fetch(PUBLIC_CONFIG_URL, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        const data = payload?.data;
        if (!response.ok || !data?.enabled || !data?.firebaseConfig || !data?.vapidKey) {
          return null;
        }
        return data;
      })
      .catch(() => null);
  }

  return publicConfigPromise;
};

const getMessagingContext = async () => {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return null;
  }

  const config = await getPublicConfig();
  if (!config) {
    return null;
  }

  if (!getApps().length) {
    initializeApp(config.firebaseConfig);
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const messaging = getMessaging(getApp());
  return { config, messaging, registration };
};

export const syncPushToken = async () => {
  const context = await getMessagingContext();
  if (!context) {
    return { ok: false, reason: "unsupported" };
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, reason: permission };
    }
  }

  if (Notification.permission !== "granted") {
    return { ok: false, reason: Notification.permission };
  }

  const token = await getToken(context.messaging, {
    vapidKey: context.config.vapidKey,
    serviceWorkerRegistration: context.registration
  }).catch(() => null);

  if (!token) {
    return { ok: false, reason: "no-token" };
  }

  return { ok: true, token };
};

export const subscribeForegroundMessages = async (handler) => {
  const context = await getMessagingContext();
  if (!context) {
    return () => {};
  }

  return onMessage(context.messaging, (payload) => {
    handler({
      title: payload?.notification?.title || payload?.data?.title || "Đơn hàng mới",
      body: payload?.notification?.body || payload?.data?.body || "Có đơn hàng mới cần xử lý.",
      url: payload?.data?.url || "/admin/orders",
      raw: payload
    });
  });
};

export const getStoredPushToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setStoredPushToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearStoredPushToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};
