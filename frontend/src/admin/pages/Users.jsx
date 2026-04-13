import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { usersService } from "../services/usersService.js";

const schema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").optional(),
  role: z.string().min(1, "Chọn vai trò"),
  status: z.string().min(1, "Chọn trạng thái")
});

export default function Users() {
  return (
    <CrudPage
      title="Người dùng"
      description="Quản lý tài khoản, vai trò và trạng thái."
      service={usersService}
      schema={schema}
      defaultValues={{ name: "", email: "", password: "", role: "USER", status: "ACTIVE" }}
      columns={[
        { key: "name", header: "Họ tên" },
        { key: "email", header: "Email" },
        { key: "role", header: "Vai trò" },
        { key: "status", header: "Trạng thái" }
      ]}
      fields={[
        { name: "name", label: "Họ tên", placeholder: "Nguyễn Văn A" },
        { name: "email", label: "Email", placeholder: "admin@..." },
        { name: "password", label: "Mật khẩu", placeholder: "••••••", type: "password" },
        {
          name: "role",
          label: "Vai trò",
          type: "select",
          options: [
            { value: "USER", label: "USER" },
            { value: "STAFF", label: "STAFF" },
            { value: "MANAGER", label: "MANAGER" },
            { value: "ADMIN", label: "ADMIN" }
          ]
        },
        {
          name: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { value: "ACTIVE", label: "ACTIVE" },
            { value: "LOCKED", label: "LOCKED" }
          ]
        }
      ]}
      mapPayload={(values) => ({
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        password: values.password || "Admin@12345"
      })}
    />
  );
}
