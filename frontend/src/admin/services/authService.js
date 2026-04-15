import { http } from "./http.js";
import { useAuthStore } from "../store/authStore.js";
import { parseJwt } from "../../lib/auth.js";
import { pushService } from "./pushService.js";

export const loginAdmin = async (payload) => {
  const res = await http.post("/auth/login", payload);
  const accessToken = res.data?.data?.accessToken;
  const refreshToken = res.data?.data?.refreshToken;
  if (res.status >= 200 && res.status < 300 && accessToken && refreshToken) {
    useAuthStore.getState().setTokens(accessToken, refreshToken);
    const profile = parseJwt(accessToken);
    useAuthStore.getState().setProfile(profile);
    await pushService.registerCurrentDevice().catch(() => null);
  }
  return res;
};

export const logoutAdmin = async () => {
  await pushService.unregisterCurrentDevice().catch(() => null);
  useAuthStore.getState().logout();
};
