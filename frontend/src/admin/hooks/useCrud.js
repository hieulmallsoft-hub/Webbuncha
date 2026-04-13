import { useEffect, useState } from "react";

export const useCrud = (service) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await service.list();
    if (res.ok) {
      setData(res.data || []);
      setError("");
    } else {
      setData(res.data || []);
      setError(res.error || "Không thể tải dữ liệu.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    let unsubscribe;
    if (service && typeof service.subscribe === "function") {
      unsubscribe = service.subscribe(() => {
        fetchData();
      });
    }
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const createItem = async (payload) => {
    const res = await service.create(payload);
    if (res.ok) {
      await fetchData();
    } else {
      setError(res.error || "Không thể tạo dữ liệu.");
    }
    return res;
  };

  const updateItem = async (id, payload) => {
    const res = await service.update(id, payload);
    if (res.ok) {
      await fetchData();
    } else {
      setError(res.error || "Không thể cập nhật dữ liệu.");
    }
    return res;
  };

  const removeItem = async (id) => {
    const res = await service.remove(id);
    if (res.ok) {
      await fetchData();
    } else {
      setError(res.error || "Không thể xóa dữ liệu.");
    }
    return res;
  };

  return { data, loading, error, refresh: fetchData, createItem, updateItem, removeItem };
};
