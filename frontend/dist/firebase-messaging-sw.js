const FIREBASE_VERSION = "11.6.0";
const PUBLIC_CONFIG_URL = "/push/public-config";

importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`);
importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`);

let messagingPromise;

const loadPublicConfig = async () => {
  try {
    const response = await fetch(PUBLIC_CONFIG_URL, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = await response.json().catch(() => null);
    const data = payload?.data;
    if (!data?.enabled || !data?.firebaseConfig) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
};

const getMessagingInstance = async () => {
  if (!messagingPromise) {
    messagingPromise = loadPublicConfig()
      .then((config) => {
        if (!config) {
          return null;
        }

        if (!self.firebase?.apps?.length) {
          self.firebase.initializeApp(config.firebaseConfig);
        }

        return self.firebase.messaging();
      })
      .catch(() => null);
  }

  return messagingPromise;
};

getMessagingInstance().then((messaging) => {
  if (!messaging) {
    return;
  }

  messaging.onBackgroundMessage((payload) => {
    const title = payload?.data?.title || payload?.notification?.title || "Đơn hàng mới";
    const body = payload?.data?.body || payload?.notification?.body || "Có đơn hàng mới cần xử lý.";
    const url = payload?.data?.url || "/admin/orders";

    self.registration.showNotification(title, {
      body,
      tag: payload?.data?.type || "ORDER_CREATED",
      renotify: true,
      data: {
        url,
        orderId: payload?.data?.orderId || ""
      }
    });
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification?.data?.url || "/admin/orders", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("navigate" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});
