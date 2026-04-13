import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { tablesService } from "../services/tablesService.js";

const schema = z.object({
  name: z.string().min(2, "Tên bàn tối thiểu 2 ký tự"),
  area: z.string().min(1, "Nhập khu vực"),
  status: z.string().min(1, "Chọn trạng thái")
});

export default function Tables() {
  return (
    <CrudPage
      title="Bàn / khu vực"
      description="Quản lý bàn và trạng thái phục vụ."
      service={tablesService}
      schema={schema}
      defaultValues={{ name: "", area: "", status: "AVAILABLE" }}
      columns={[
        { key: "name", header: "Bàn" },
        { key: "area", header: "Khu vực" },
        { key: "status", header: "Trạng thái" }
      ]}
      fields={[
        { name: "name", label: "Tên bàn", placeholder: "Bàn 01" },
        { name: "area", label: "Khu vực", placeholder: "Tầng 1" },
        {
          name: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { value: "AVAILABLE", label: "Trống" },
            { value: "RESERVED", label: "Đã đặt" },
            { value: "OCCUPIED", label: "Đang phục vụ" }
          ]
        }
      ]}
    />
  );
}
