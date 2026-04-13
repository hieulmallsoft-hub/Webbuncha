export const ROLE_PERMISSIONS = {
  ADMIN: [
    "dashboard",
    "users",
    "roles",
    "categories",
    "products",
    "orders",
    "tables",
    "coupons",
    "reviews",
    "notifications",
    "settings"
  ],
  STAFF: ["dashboard", "orders", "tables", "reviews"],
  MANAGER: ["dashboard", "users", "roles", "orders", "products", "categories"]
};

export const hasPermission = (roles, permission) => {
  if (!roles || roles.length === 0) {
    return false;
  }
  return roles.some((role) => (ROLE_PERMISSIONS[role] || []).includes(permission));
};
