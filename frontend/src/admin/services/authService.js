import { http } from "./http.js";
import { useAuthStore } from "../store/authStore.js";
import { parseJwt } from "../../lib/auth.js";

export const loginAdmin = async (payload) => {
  const res = await http.post("/auth/login", payload);
  const accessToken = res.data?.data?.accessToken;
  const refreshToken = res.data?.data?.refreshToken;
  if (res.status >= 200 && res.status < 300 && accessToken && refreshToken) {
    useAuthStore.getState().setTokens(accessToken, refreshToken);
    const profile = parseJwt(accessToken);
    useAuthStore.getState().setProfile(profile);
  }
  return res;
};

export const logoutAdmin = () => {
  useAuthStore.getState().logout();
};
