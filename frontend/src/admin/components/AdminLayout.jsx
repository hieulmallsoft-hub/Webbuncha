import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import ToastContainer from "./ToastContainer.jsx";
import { useAdminPushNotifications } from "../hooks/useAdminPushNotifications.js";

export default function AdminLayout() {
  useAdminPushNotifications();

  return (
    <div className="admin-shell restaurant-play lux-shell">
      <div className="restaurant-decor admin-decor" aria-hidden="true">
        <span className="decor-lantern lantern-left" />
        <span className="decor-lantern lantern-right" />
        <span className="decor-steam steam-left" />
        <span className="decor-steam steam-right" />
        <span className="decor-dumpling dumpling-left" />
        <span className="decor-dumpling dumpling-right" />
        <span className="decor-orbit orbit-left" />
        <span className="decor-orbit orbit-right" />
        <span className="decor-spark spark-left" />
        <span className="decor-spark spark-right" />
      </div>
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
