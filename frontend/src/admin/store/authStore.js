import { create } from "zustand";

const ACCESS_KEY = "admin_access_token";
const REFRESH_KEY = "admin_refresh_token";

export const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem(ACCESS_KEY),
  refreshToken: localStorage.getItem(REFRESH_KEY),
  profile: null,
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem(ACCESS_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_KEY, refreshToken);
    }
    set({ accessToken, refreshToken });
  },
  setProfile: (profile) => set({ profile }),
  logout: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    set({ accessToken: null, refreshToken: null, profile: null });
  }
}));
