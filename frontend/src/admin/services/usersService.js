import { http } from "./http.js";
import { createStore } from "./mockDb.js";

const seedUsers = [
  {
    id: 1,
    name: "Admin Chinh Hương",
    email: "admin@bunchachinhhuong.vn",
    role: "ADMIN",
    status: "ACTIVE"
  },
  {
    id: 2,
    name: "Thu ngân",
    email: "cashier@bunchachinhhuong.vn",
    role: "STAFF",
    status: "ACTIVE"
  }
];

const store = createStore("users", seedUsers);
store.init();

export const usersService = {
  async list() {
    const res = await http.get("/users");
    if (res.status >= 200 && res.status < 300 && Array.isArray(res.data?.data)) {
      return { ok: true, data: res.data.data };
    }
    return { ok: false, data: store.list(), error: res.data?.message };
  },
  async create(payload) {
    const res = await http.post("/users", payload);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, data: store.create(payload), error: res.data?.message };
  },
  async update(id, payload) {
    const res = await http.put(`/users/${id}`, payload);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, data: store.update(id, payload), error: res.data?.message };
  },
  async remove(id) {
    const res = await http.delete(`/users/${id}`);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true };
    }
    store.remove(id);
    return { ok: false, error: res.data?.message };
  }
};
