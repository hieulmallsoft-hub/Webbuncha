import { createStore } from "./mockDb.js";

const seed = [
  { id: 1, customer: "Ngọc Anh", rating: 5, content: "Bún chả ngon, phục vụ nhanh.", status: "APPROVED" },
  { id: 2, customer: "Quang Huy", rating: 4, content: "Nước chấm đậm đà.", status: "PENDING" }
];

const store = createStore("reviews", seed);
store.init();

export const reviewsService = {
  list: async () => ({ ok: true, data: store.list() }),
  create: async (payload) => ({ ok: true, data: store.create(payload) }),
  update: async (id, payload) => ({ ok: true, data: store.update(id, payload) }),
  remove: async (id) => {
    store.remove(id);
    return { ok: true };
  }
};
