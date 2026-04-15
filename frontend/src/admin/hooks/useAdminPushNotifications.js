import { useEffect } from "react";
import { pushService } from "../services/pushService.js";
import { useAuthStore } from "../store/authStore.js";
import { useUiStore } from "../store/uiStore.js";

export const useAdminPushNotifications = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addToast = useUiStore((state) => state.addToast);

  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;

    if (!accessToken) {
      return () => {};
    }

    const setup = async () => {
      const registration = await pushService.registerCurrentDevice();
      if (!active) {
        return;
      }

      if (!registration.ok && registration.reason === "denied") {
        addToast({
          type: "warning",
          title: "Thông báo đang tắt",
          message: "Hãy bật quyền thông báo trên Android để nhận đơn mới ngay."
        });
      }

      unsubscribe = await pushService.subscribe((payload) => {
        addToast({
          type: "info",
          title: payload.title,
          message: payload.body
        });
      });
    };

    setup();

    return () => {
      active = false;
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [accessToken, addToast]);
};
