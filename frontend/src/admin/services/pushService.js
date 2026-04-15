import { http } from "./http.js";
import {
  clearStoredPushToken,
  getStoredPushToken,
  setStoredPushToken,
  subscribeForegroundMessages,
  syncPushToken
} from "../../lib/firebaseMessaging.js";

const toError = (res, fallback) => res.data?.message || fallback;

const buildPayload = (token) => ({
  token,
  platform: "ANDROID_WEB",
  userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
});

export const pushService = {
  async registerCurrentDevice() {
    const result = await syncPushToken();
    if (!result.ok) {
      return result;
    }

    const previousToken = getStoredPushToken();
    if (previousToken && previousToken !== result.token) {
      await http.post("/push/tokens/unregister", buildPayload(previousToken));
    }

    const res = await http.post("/push/tokens/register", buildPayload(result.token));
    if (res.status >= 200 && res.status < 300) {
      setStoredPushToken(result.token);
      return { ok: true, token: result.token };
    }

    return { ok: false, reason: "register-failed", error: toError(res, "Không thể đăng ký nhận thông báo.") };
  },

  async unregisterCurrentDevice() {
    const token = getStoredPushToken();
    if (!token) {
      clearStoredPushToken();
      return { ok: true };
    }

    const res = await http.post("/push/tokens/unregister", buildPayload(token));
    clearStoredPushToken();
    if (res.status >= 200 && res.status < 300) {
      return { ok: true };
    }

    return { ok: false, error: toError(res, "Không thể hủy đăng ký thông báo.") };
  },

  subscribe(handler) {
    return subscribeForegroundMessages(handler);
  }
};
