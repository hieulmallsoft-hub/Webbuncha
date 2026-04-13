import { createStore } from "./mockDb.js";

const seed = [
  { id: 1, name: "ADMIN", permissions: ["*"], status: "ACTIVE" },
  { id: 2, name: "MANAGER", permissions: ["orders", "products", "categories"], status: "ACTIVE" },
  { id: 3, name: "STAFF", permissions: ["orders", "tables"], status: "ACTIVE" }
];

const store = createStore("roles", seed);
store.init();

export const rolesService = {
  list: async () => ({ ok: true, data: store.list() }),
  create: async (payload) => ({ ok: true, data: store.create(payload) }),
  update: async (id, payload) => ({ ok: true, data: store.update(id, payload) }),
  remove: async (id) => {
    store.remove(id);
    return { ok: true };
  }
};
