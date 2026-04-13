import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { parseJwt } from "../../lib/auth.js";

export default function AdminGuard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const profile = useAuthStore((state) => state.profile);

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  const payload = profile || parseJwt(accessToken);
  if (!payload || !payload.roles?.includes("ROLE_ADMIN")) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
