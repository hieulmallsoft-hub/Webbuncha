import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { reviewsService } from "../services/reviewsService.js";

const schema = z.object({
  customer: z.string().min(2, "Tên khách hàng tối thiểu 2 ký tự"),
  rating: z.string().min(1, "Chọn số sao"),
  content: z.string().min(3, "Nội dung tối thiểu 3 ký tự"),
  status: z.string().min(1, "Chọn trạng thái")
});

export default function Reviews() {
  return (
    <CrudPage
      title="Đánh giá / phản hồi"
      description="Duyệt và quản lý đánh giá từ khách hàng."
      service={reviewsService}
      schema={schema}
      defaultValues={{ customer: "", rating: "5", content: "", status: "PENDING" }}
      columns={[
        { key: "customer", header: "Khách hàng" },
        { key: "rating", header: "Sao" },
        { key: "content", header: "Nội dung" },
        { key: "status", header: "Trạng thái" }
      ]}
      fields={[
        { name: "customer", label: "Khách hàng", placeholder: "Ngọc Anh" },
        {
          name: "rating",
          label: "Số sao",
          type: "select",
          options: [
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" }
          ]
        },
        { name: "content", label: "Nội dung", placeholder: "Bún chả ngon..." },
        {
          name: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { value: "PENDING", label: "Chờ duyệt" },
            { value: "APPROVED", label: "Đã duyệt" },
            { value: "HIDDEN", label: "Ẩn" }
          ]
        }
      ]}
    />
  );
}
