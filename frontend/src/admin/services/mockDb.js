const prefix = "admin_mock_";

const load = (key, fallback) => {
  const raw = localStorage.getItem(prefix + key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const save = (key, value) => {
  localStorage.setItem(prefix + key, JSON.stringify(value));
};

const ensureSeed = (key, seed = []) => {
  const existing = load(key, null);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    save(key, seed);
    return seed;
  }
  return existing;
};

const nextId = (items) => {
  const max = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return max + 1;
};

export const createStore = (key, seed = []) => {
  const init = () => ensureSeed(key, seed);
  const list = () => load(key, []);
  const create = (payload) => {
    const items = list();
    const item = { id: nextId(items), ...payload };
    const next = [item, ...items];
    save(key, next);
    return item;
  };
  const update = (id, payload) => {
    const items = list();
    const next = items.map((item) => (String(item.id) === String(id) ? { ...item, ...payload } : item));
    save(key, next);
    return next.find((item) => String(item.id) === String(id));
  };
  const remove = (id) => {
    const items = list();
    const next = items.filter((item) => String(item.id) !== String(id));
    save(key, next);
    return true;
  };
  return { init, list, create, update, remove };
};
