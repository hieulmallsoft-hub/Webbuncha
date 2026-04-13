import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { notificationsService } from "../services/notificationsService.js";

const schema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự"),
  content: z.string().min(3, "Nội dung tối thiểu 3 ký tự"),
  status: z.string().min(1, "Chọn trạng thái")
});

export default function Notifications() {
  return (
    <CrudPage
      title="Thông báo hệ thống"
      description="Tạo và quản lý thông báo cho người dùng."
      service={notificationsService}
      schema={schema}
      defaultValues={{ title: "", content: "", status: "UNREAD" }}
      columns={[
        { key: "title", header: "Tiêu đề" },
        { key: "content", header: "Nội dung" },
        { key: "status", header: "Trạng thái" }
      ]}
      fields={[
        { name: "title", label: "Tiêu đề", placeholder: "Đơn hàng mới" },
        { name: "content", label: "Nội dung", placeholder: "Đơn #102 mới được tạo" },
        {
          name: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { value: "UNREAD", label: "Chưa đọc" },
            { value: "READ", label: "Đã đọc" }
          ]
        }
      ]}
    />
  );
}
