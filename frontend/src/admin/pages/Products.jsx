import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { productsService } from "../services/productsService.js";
import { categoriesService } from "../services/categoriesService.js";
import { formatCurrency } from "../utils/format.js";

const schema = z.object({
  name: z.string().min(2, "Tên món tối thiểu 2 ký tự"),
  price: z.string().min(1, "Nhập giá"),
  categoryId: z.string().min(1, "Chọn danh mục"),
  description: z.string().max(255, "Mô tả tối đa 255 ký tự").optional(),
  imageUrl: z.string().max(255, "Image URL tối đa 255 ký tự").optional()
});

export default function Products() {
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const res = await categoriesService.list();
      if (!active) return;
      if (res.ok) {
        const options = (res.data || []).map((item) => ({
          value: String(item.id),
          label: item.name
        }));
        setCategoryOptions(options);
      } else {
        setCategoryOptions([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const fields = useMemo(
    () => [
      { name: "name", label: "Tên món", placeholder: "Bún chả viên" },
      { name: "price", label: "Giá (VND)", placeholder: "60000", type: "number" },
      {
        name: "categoryId",
        label: "Danh mục",
        type: "select",
        options: categoryOptions.length ? categoryOptions : [{ value: "", label: "Chọn danh mục" }]
      },
      { name: "description", label: "Mô tả", placeholder: "Mô tả món ăn" },
      { name: "imageUrl", label: "Ảnh (URL)", placeholder: "/images/..." }
    ],
    [categoryOptions]
  );

  return (
    <CrudPage
      title="Món ăn / sản phẩm"
      description="Quản lý món ăn, giá và danh mục."
      service={productsService}
      schema={schema}
      defaultValues={{ name: "", price: "", categoryId: "", description: "", imageUrl: "" }}
      columns={[
        { key: "name", header: "Món" },
        { key: "categoryName", header: "Danh mục" },
        { key: "price", header: "Giá", render: (row) => formatCurrency(row.price) }
      ]}
      fields={fields}
      mapPayload={(values) => ({
        name: values.name,
        description: values.description || null,
        imageUrl: values.imageUrl || null,
        price: Number(values.price),
        categoryId: Number(values.categoryId)
      })}
    />
  );
}
