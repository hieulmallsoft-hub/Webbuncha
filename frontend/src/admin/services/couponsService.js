import { createStore } from "./mockDb.js";

const seed = [
  { id: 1, code: "BUNCHA10", type: "PERCENT", value: 10, status: "ACTIVE", usageLimit: 100 },
  { id: 2, code: "FREESHIP", type: "AMOUNT", value: 15000, status: "ACTIVE", usageLimit: 50 }
];

const store = createStore("coupons", seed);
store.init();

export const couponsService = {
  list: async () => ({ ok: true, data: store.list() }),
  create: async (payload) => ({ ok: true, data: store.create(payload) }),
  update: async (id, payload) => ({ ok: true, data: store.update(id, payload) }),
  remove: async (id) => {
    store.remove(id);
    return { ok: true };
  }
};
