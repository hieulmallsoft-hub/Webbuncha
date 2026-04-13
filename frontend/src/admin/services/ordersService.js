import { http } from "./http.js";
import { createStore } from "./mockDb.js";

const seedOrders = [
  {
    id: 1,
    product: "Bún chả viên",
    quantity: 1,
    price: 60000,
    orderType: "DELIVERY",
    paymentMethod: "COD",
    receiverName: "Lê Minh Hiếu",
    receiverPhone: "0394338212",
    deliveryAddress: "ngách 219/77, Định Công Thượng, Hà Nội",
    status: "PENDING"
  },
  {
    id: 2,
    product: "Bún chả lẫn",
    quantity: 1,
    price: 70000,
    orderType: "DELIVERY",
    paymentMethod: "COD",
    receiverName: "Lê Minh Hiếu",
    receiverPhone: "0394338212",
    deliveryAddress: "ngách 219/77, Định Công Thượng, Hà Nội",
    status: "PENDING"
  }
];

const store = createStore("orders", seedOrders);
store.init();

export const ordersService = {
  async list() {
    const res = await http.get("/orders");
    if (res.status >= 200 && res.status < 300) {
      const payload = res.data?.data;
      if (Array.isArray(payload) || payload?.content) {
        return { ok: true, data: payload };
      }
    }
    return { ok: false, data: store.list(), error: res.data?.message };
  },
  async updateStatus(id, status) {
    const res = await http.patch(`/orders/${id}/status?status=${status}`);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, data: store.update(id, { status }), error: res.data?.message };
  }
};
