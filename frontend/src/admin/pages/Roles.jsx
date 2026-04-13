import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { rolesService } from "../services/rolesService.js";

const schema = z.object({
  name: z.string().min(2, "Tên vai trò tối thiểu 2 ký tự"),
  permissions: z.string().optional(),
  status: z.string().min(1, "Chọn trạng thái")
});

export default function Roles() {
  return (
    <CrudPage
      title="Vai trò & quyền"
      description="Tạo role và quản lý quyền truy cập."
      service={rolesService}
      schema={schema}
      defaultValues={{ name: "", permissions: "", status: "ACTIVE" }}
      columns={[
        { key: "name", header: "Vai trò" },
        {
          key: "permissions",
          header: "Quyền",
          render: (row) => (Array.isArray(row.permissions) ? row.permissions.join(", ") : row.permissions)
        },
        { key: "status", header: "Trạng thái" }
      ]}
      fields={[
        { name: "name", label: "Tên vai trò", placeholder: "MANAGER" },
        { name: "permissions", label: "Quyền (comma separated)", placeholder: "orders, products" },
        {
          name: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { value: "ACTIVE", label: "ACTIVE" },
            { value: "INACTIVE", label: "INACTIVE" }
          ]
        }
      ]}
      mapPayload={(values) => ({
        name: values.name,
        permissions: values.permissions
          ? values.permissions.split(",").map((item) => item.trim())
          : [],
        status: values.status
      })}
    />
  );
}
