export const adminNav = [
  {
    label: "Tổng quan",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", permission: "dashboard" }
    ]
  },
  {
    label: "Quản trị",
    items: [
      { to: "/admin/users", label: "Người dùng", permission: "users" },
      { to: "/admin/roles", label: "Vai trò & quyền", permission: "roles" },
      { to: "/admin/categories", label: "Danh mục", permission: "categories" },
      { to: "/admin/products", label: "Món ăn / sản phẩm", permission: "products" },
      { to: "/admin/orders", label: "Đơn hàng", permission: "orders" },
      { to: "/admin/tables", label: "Bàn / khu vực", permission: "tables" },
      { to: "/admin/coupons", label: "Mã giảm giá", permission: "coupons" },
      { to: "/admin/reviews", label: "Đánh giá", permission: "reviews" },
      { to: "/admin/notifications", label: "Thông báo", permission: "notifications" },
      { to: "/admin/settings", label: "Cài đặt hệ thống", permission: "settings" }
    ]
  }
];
