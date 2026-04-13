import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { couponsService } from "../services/couponsService.js";

const schema = z.object({
  code: z.string().min(3, "Mã giảm giá tối thiểu 3 ký tự"),
  type: z.string().min(1, "Chọn loại"),
  value: z.string().min(1, "Nhập giá trị"),
  usageLimit: z.string().min(1, "Nhập giới hạn"),
  status: z.string().min(1, "Chọn trạng thái")
});

export default function Coupons() {
  return (
    <CrudPage
      title="Mã giảm giá"
      description="Quản lý chương trình khuyến mãi."
      service={couponsService}
      schema={schema}
      defaultValues={{ code: "", type: "PERCENT", value: "", usageLimit: "", status: "ACTIVE" }}
      columns={[
        { key: "code", header: "Mã" },
        { key: "type", header: "Loại" },
        { key: "value", header: "Giá trị" },
        { key: "usageLimit", header: "Giới hạn" },
        { key: "status", header: "Trạng thái" }
      ]}
      fields={[
        { name: "code", label: "Mã giảm giá", placeholder: "SALE10" },
        {
          name: "type",
          label: "Loại",
          type: "select",
          options: [
            { value: "PERCENT", label: "Theo %" },
            { value: "AMOUNT", label: "Theo số tiền" }
          ]
        },
        { name: "value", label: "Giá trị", placeholder: "10", type: "number" },
        { name: "usageLimit", label: "Số lượt dùng", placeholder: "100", type: "number" },
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
        ...values,
        value: Number(values.value),
        usageLimit: Number(values.usageLimit)
      })}
    />
  );
}
