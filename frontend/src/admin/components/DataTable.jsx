import { useMemo, useState } from "react";
import clsx from "clsx";
import { useDebounce } from "../hooks/useDebounce.js";

export default function DataTable({ columns, rows, actions, searchPlaceholder = "Tìm kiếm..." }) {
  const [query, setQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const debounced = useDebounce(query, 250);

  const filtered = useMemo(() => {
    if (!debounced) return rows;
    const lowered = debounced.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value || "").toLowerCase().includes(lowered)
      )
    );
  }, [rows, debounced]);

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;
    const next = [...filtered];
    next.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      const order = sortConfig.direction === "asc" ? 1 : -1;
      return aVal > bVal ? order : -order;
    });
    return next;
  }, [filtered, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div className="admin-table">
      <div className="admin-table-toolbar">
        <input
          className="admin-input"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <span className="text-xs text-ink/60">
          {sorted.length} kết quả
        </span>
      </div>
      <div className="admin-table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => toggleSort(col.key)}>
                  <span className="flex items-center gap-2">
                    {col.header}
                    {sortConfig.key === col.key && (
                      <span className="text-xs">{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th>Hành động</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
                {actions && <td>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-table-footer">
        <button
          className={clsx("admin-button ghost", page === 1 && "is-disabled")}
          type="button"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Trước
        </button>
        <span className="text-xs text-ink/60">
          Trang {page} / {totalPages}
        </span>
        <button
          className={clsx("admin-button ghost", page >= totalPages && "is-disabled")}
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
