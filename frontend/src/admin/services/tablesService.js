import { createStore } from "./mockDb.js";

const seed = [
  { id: 1, name: "Bàn 01", area: "Tầng 1", status: "AVAILABLE" },
  { id: 2, name: "Bàn 02", area: "Tầng 1", status: "RESERVED" },
  { id: 3, name: "Bàn 10", area: "Tầng 2", status: "OCCUPIED" }
];

const store = createStore("tables", seed);
store.init();

export const tablesService = {
  list: async () => ({ ok: true, data: store.list() }),
  create: async (payload) => ({ ok: true, data: store.create(payload) }),
  update: async (id, payload) => ({ ok: true, data: store.update(id, payload) }),
  remove: async (id) => {
    store.remove(id);
    return { ok: true };
  }
};
