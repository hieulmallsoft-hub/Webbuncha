import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DataTable from "./DataTable.jsx";
import Modal from "./Modal.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { useCrud } from "../hooks/useCrud.js";
import { useUiStore } from "../store/uiStore.js";
import LoadingOverlay from "../../components/LoadingOverlay.jsx";

export default function CrudPage({
  title,
  description,
  columns,
  service,
  schema,
  defaultValues,
  fields,
  mapPayload
}) {
  const { data, loading, error, createItem, updateItem, removeItem } = useCrud(service);
  const addToast = useUiStore((state) => state.addToast);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const formDefaults = useMemo(() => ({ ...(defaultValues || {}) }), [defaultValues]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: formDefaults
  });

  const openCreate = () => {
    setEditing(null);
    reset(formDefaults);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    reset({ ...formDefaults, ...row });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = mapPayload ? mapPayload(values) : values;
    if (editing) {
      const res = await updateItem(editing.id, payload);
      if (res.ok) {
        addToast({ type: "success", title: "Đã cập nhật", message: `${title} đã được cập nhật.` });
      }
    } else {
      const res = await createItem(payload);
      if (res.ok) {
        addToast({ type: "success", title: "Đã tạo mới", message: `${title} đã được tạo.` });
      }
    }
    setOpen(false);
  };

  const confirmDelete = (row) => {
    setPendingDelete(row);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const res = await removeItem(pendingDelete.id);
    if (res.ok) {
      addToast({ type: "success", title: "Đã xóa", message: `${title} đã được xóa.` });
    }
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl">{title}</h3>
            {description && <p className="text-sm text-ink/60">{description}</p>}
          </div>
          <button className="admin-button primary" type="button" onClick={openCreate}>
            Thêm mới
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        {loading ? (
          <LoadingOverlay label="Đang đồng bộ dữ liệu..." className="mt-4 admin-loader" />
        ) : (
          <div className="mt-6">
            <DataTable
              columns={columns}
              rows={data}
              actions={(row) => (
                <div className="flex gap-2">
                  <button className="admin-button ghost" type="button" onClick={() => openEdit(row)}>
                    Sửa
                  </button>
                  <button className="admin-button danger" type="button" onClick={() => confirmDelete(row)}>
                    Xóa
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? `Cập nhật ${title}` : `Thêm ${title}`}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex flex-wrap gap-3">
            <button className="admin-button ghost" type="button" onClick={() => setOpen(false)}>
              Hủy
            </button>
            <button className="admin-button primary" type="submit" form="crud-form" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        }
      >
        <form id="crud-form" className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field) => (
            <div key={field.name}>
              <label className="admin-label">{field.label}</label>
              {field.type === "select" ? (
                <select className="admin-input" {...register(field.name)}>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="admin-input"
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                />
              )}
              {errors[field.name] && (
                <p className="admin-error">{errors[field.name]?.message?.toString()}</p>
              )}
            </div>
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc muốn xóa ${pendingDelete?.name || pendingDelete?.code || "mục này"}?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
