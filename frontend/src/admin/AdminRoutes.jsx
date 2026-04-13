import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminGuard from "./components/AdminGuard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import Roles from "./pages/Roles.jsx";
import Categories from "./pages/Categories.jsx";
import Products from "./pages/Products.jsx";
import Orders from "./pages/Orders.jsx";
import Tables from "./pages/Tables.jsx";
import Coupons from "./pages/Coupons.jsx";
import Reviews from "./pages/Reviews.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="tables" element={<Tables />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
