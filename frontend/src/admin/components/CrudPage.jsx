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
  const [uploadingField, setUploadingField] = useState("");

  const formDefaults = useMemo(() => ({ ...(defaultValues || {}) }), [defaultValues]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
        addToast({ type: "success", title: "Da cap nhat", message: `${title} da duoc cap nhat.` });
      }
    } else {
      const res = await createItem(payload);
      if (res.ok) {
        addToast({ type: "success", title: "Da tao moi", message: `${title} da duoc tao.` });
      }
    }
    setOpen(false);
  };

  const handleImageUpload = async (field, file) => {
    if (!file || typeof field.upload !== "function") {
      return;
    }

    setUploadingField(field.name);
    const res = await field.upload(file);
    setUploadingField("");

    if (res.ok && res.data?.url) {
      setValue(field.name, res.data.url, { shouldValidate: true, shouldDirty: true });
      addToast({
        type: "success",
        title: "Anh da tai len",
        message: "Da luu anh len may chu va cap nhat duong dan."
      });
      return;
    }

    addToast({
      type: "error",
      title: "Tai anh that bai",
      message: res.error || "Khong the tai anh len may chu."
    });
  };

  const confirmDelete = (row) => {
    setPendingDelete(row);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const res = await removeItem(pendingDelete.id);
    if (res.ok) {
      addToast({ type: "success", title: "Da xoa", message: `${title} da duoc xoa.` });
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
            {description ? <p className="text-sm text-ink/60">{description}</p> : null}
          </div>
          <button className="admin-button primary" type="button" onClick={openCreate}>
            Them moi
          </button>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        {loading ? (
          <LoadingOverlay label="Dang dong bo du lieu..." className="mt-4 admin-loader" />
        ) : (
          <div className="mt-6">
            <DataTable
              columns={columns}
              rows={data}
              actions={(row) => (
                <div className="flex gap-2">
                  <button className="admin-button ghost" type="button" onClick={() => openEdit(row)}>
                    Sua
                  </button>
                  <button className="admin-button danger" type="button" onClick={() => confirmDelete(row)}>
                    Xoa
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? `Cap nhat ${title}` : `Them ${title}`}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex flex-wrap gap-3">
            <button className="admin-button ghost" type="button" onClick={() => setOpen(false)}>
              Huy
            </button>
            <button className="admin-button primary" type="submit" form="crud-form" disabled={isSubmitting}>
              {isSubmitting ? "Dang luu..." : "Luu"}
            </button>
          </div>
        }
      >
        <form id="crud-form" className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field) => {
            const previewValue = watch(field.name);

            return (
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
                ) : field.type === "image" ? (
                  <div className="grid gap-3">
                    <input
                      className="admin-input"
                      type="text"
                      placeholder={field.placeholder}
                      {...register(field.name)}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="admin-button ghost cursor-pointer">
                        Chon anh tu may
                        <input
                          className="hidden"
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleImageUpload(field, event.target.files?.[0])}
                        />
                      </label>
                      <span className="text-xs text-ink/60">
                        {uploadingField === field.name
                          ? "Dang tai anh..."
                          : "Ban co the dan URL hoac chon anh tu may."}
                      </span>
                    </div>
                    {previewValue ? (
                      <div className="rounded-2xl border border-ink/10 bg-white/70 p-3">
                        <img className="h-32 w-full rounded-xl object-cover" src={previewValue} alt={field.label} />
                        <p className="mt-2 break-all text-xs text-ink/60">{previewValue}</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <input
                    className="admin-input"
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    {...register(field.name)}
                  />
                )}
                {errors[field.name] ? (
                  <p className="admin-error">{errors[field.name]?.message?.toString()}</p>
                ) : null}
              </div>
            );
          })}
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Xac nhan xoa"
        description={`Ban co chac muon xoa ${pendingDelete?.name || pendingDelete?.code || "muc nay"}?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
