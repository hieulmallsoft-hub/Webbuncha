const TOKEN_KEY = "auth_token";
const PROFILE_NAME_KEY = "profile_name";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setProfileName = (name) => {
  if (name) {
    localStorage.setItem(PROFILE_NAME_KEY, name);
  }
};

export const getProfileName = () => localStorage.getItem(PROFILE_NAME_KEY);

const decodeBase64Url = (value) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(padded);
  try {
    return decodeURIComponent(
      decoded
        .split("")
        .map((char) => "%" + char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch (error) {
    return decoded;
  }
};

export const parseJwt = (token) => {
  if (!token) {
    return null;
  }
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  try {
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch (error) {
    return null;
  }
};

export const getProfileFromToken = () => {
  const token = getToken();
  const payload = parseJwt(token);
  if (!payload) {
    return null;
  }
  return {
    email: payload.sub,
    roles: payload.roles || [],
    expiresAt: payload.exp ? new Date(payload.exp * 1000) : null
  };
};
