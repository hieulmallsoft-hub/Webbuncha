import { notification } from "antd";

const normalizeDuration = (duration) => {
  if (duration === 0) return 0;
  if (!duration) return 3;
  return duration > 10 ? duration / 1000 : duration;
};

notification.config({
  placement: "topRight",
  maxCount: 4,
  duration: 3,
  zIndex: 2000
});

export const notify = ({ type = "info", title, message, duration, placement } = {}) => {
  const fn = notification[type] || notification.info;
  fn({
    message: title || "Thông báo",
    description: message || "",
    placement: placement || "topRight",
    duration: normalizeDuration(duration)
  });
};
