import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { categoriesService } from "../services/categoriesService.js";

const schema = z.object({
  name: z.string().min(2, "Tên danh mục tối thiểu 2 ký tự"),
  description: z.string().max(255, "Mô tả tối đa 255 ký tự").optional(),
  imageUrl: z.string().max(255, "Image URL tối đa 255 ký tự").optional()
});

export default function Categories() {
  return (
    <CrudPage
      title="Danh mục"
      description="Quản lý danh mục món ăn."
      service={categoriesService}
      schema={schema}
      defaultValues={{ name: "", description: "", imageUrl: "" }}
      columns={[
        { key: "name", header: "Tên danh mục" },
        { key: "description", header: "Mô tả" }
      ]}
      fields={[
        { name: "name", label: "Tên danh mục", placeholder: "Bún chả" },
        { name: "description", label: "Mô tả", placeholder: "Món nướng truyền thống" },
        { name: "imageUrl", label: "Ảnh (URL)", placeholder: "/images/..." }
      ]}
    />
  );
}
