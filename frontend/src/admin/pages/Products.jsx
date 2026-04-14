import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { productsService } from "../services/productsService.js";
import { categoriesService } from "../services/categoriesService.js";
import { uploadService } from "../services/uploadService.js";
import { formatCurrency } from "../utils/format.js";

const schema = z.object({
  name: z.string().min(2, "Ten mon toi thieu 2 ky tu"),
  price: z.string().min(1, "Nhap gia"),
  categoryId: z.string().min(1, "Chon danh muc"),
  description: z.string().max(255, "Mo ta toi da 255 ky tu").optional(),
  imageUrl: z.string().max(255, "Duong dan anh toi da 255 ky tu").optional()
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
      { name: "name", label: "Ten mon", placeholder: "Bun cha vien" },
      { name: "price", label: "Gia (VND)", placeholder: "60000", type: "number" },
      {
        name: "categoryId",
        label: "Danh muc",
        type: "select",
        options: categoryOptions.length ? categoryOptions : [{ value: "", label: "Chon danh muc" }]
      },
      { name: "description", label: "Mo ta", placeholder: "Mo ta mon an" },
      {
        name: "imageUrl",
        label: "Anh",
        type: "image",
        placeholder: "https://... hoac /uploads/...",
        upload: uploadService.uploadImage
      }
    ],
    [categoryOptions]
  );

  return (
    <CrudPage
      title="Mon an / san pham"
      description="Quan ly mon an, gia va danh muc."
      service={productsService}
      schema={schema}
      defaultValues={{ name: "", price: "", categoryId: "", description: "", imageUrl: "" }}
      columns={[
        { key: "name", header: "Mon" },
        { key: "categoryName", header: "Danh muc" },
        { key: "price", header: "Gia", render: (row) => formatCurrency(row.price) }
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
