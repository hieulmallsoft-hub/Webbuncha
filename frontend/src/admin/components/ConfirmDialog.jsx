import Modal from "./Modal.jsx";

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex flex-wrap gap-3">
          <button className="admin-button ghost" type="button" onClick={onCancel}>
            Hủy
          </button>
          <button className="admin-button danger" type="button" onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      }
    >
      <p className="text-sm text-ink/70">{description}</p>
    </Modal>
  );
}
