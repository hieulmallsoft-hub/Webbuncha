const CUSTOMER_REVIEWS_KEY = "customer_reviews";
const LEGACY_ADMIN_REVIEWS_KEY = "admin_mock_reviews";

const seed = [
  {
    id: 1,
    customer: "Ngọc Anh",
    rating: 5,
    content: "Bún chả ngon, phục vụ nhanh.",
    status: "APPROVED",
    createdAt: new Date("2026-04-01T11:30:00+07:00").toISOString()
  },
  {
    id: 2,
    customer: "Quang Huy",
    rating: 4,
    content: "Nước chấm đậm đà.",
    status: "PENDING",
    createdAt: new Date("2026-04-02T19:00:00+07:00").toISOString()
  }
];

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const normalizeReview = (review, fallbackId) => ({
  id: review?.id ?? fallbackId,
  customer: review?.customer || review?.email || "Khách hàng",
  rating: Number(review?.rating) || 5,
  content: review?.content || "",
  status: review?.status || "APPROVED",
  createdAt: review?.createdAt || new Date().toISOString()
});

const sortReviews = (items) =>
  [...items].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime() || 0;
    const timeB = new Date(b.createdAt || 0).getTime() || 0;
    return timeB - timeA || Number(b.id || 0) - Number(a.id || 0);
  });

const persist = (items) => {
  const normalized = sortReviews(items.map((item, index) => normalizeReview(item, index + 1)));
  const serialized = JSON.stringify(normalized);
  localStorage.setItem(CUSTOMER_REVIEWS_KEY, serialized);
  localStorage.setItem(LEGACY_ADMIN_REVIEWS_KEY, serialized);
  return normalized;
};

const loadReviews = () => {
  const customerReviews = readJson(CUSTOMER_REVIEWS_KEY);
  const legacyReviews = readJson(LEGACY_ADMIN_REVIEWS_KEY);
  const source = customerReviews.length > 0 ? customerReviews : legacyReviews;

  if (source.length > 0) {
    return persist(source);
  }

  return persist(seed);
};

const nextId = (items) => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

export const reviewsService = {
  async list() {
    return { ok: true, data: loadReviews() };
  },

  async create(payload) {
    const items = loadReviews();
    const created = normalizeReview({ ...payload, id: nextId(items) }, nextId(items));
    const next = persist([created, ...items]);
    return { ok: true, data: next.find((item) => String(item.id) === String(created.id)) };
  },

  async update(id, payload) {
    const items = loadReviews();
    const next = persist(
      items.map((item) =>
        String(item.id) === String(id)
          ? normalizeReview({ ...item, ...payload, id: item.id }, item.id)
          : normalizeReview(item, item.id)
      )
    );
    return { ok: true, data: next.find((item) => String(item.id) === String(id)) };
  },

  async remove(id) {
    const items = loadReviews();
    persist(items.filter((item) => String(item.id) !== String(id)));
    return { ok: true };
  }
};
