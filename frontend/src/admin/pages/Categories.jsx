import { z } from "zod";
import CrudPage from "../components/CrudPage.jsx";
import { categoriesService } from "../services/categoriesService.js";
import { uploadService } from "../services/uploadService.js";

const schema = z.object({
  name: z.string().min(2, "Ten danh muc toi thieu 2 ky tu"),
  description: z.string().max(255, "Mo ta toi da 255 ky tu").optional(),
  imageUrl: z.string().max(255, "Duong dan anh toi da 255 ky tu").optional()
});

export default function Categories() {
  return (
    <CrudPage
      title="Danh muc"
      description="Quan ly danh muc mon an."
      service={categoriesService}
      schema={schema}
      defaultValues={{ name: "", description: "", imageUrl: "" }}
      columns={[
        { key: "name", header: "Ten danh muc" },
        { key: "description", header: "Mo ta" }
      ]}
      fields={[
        { name: "name", label: "Ten danh muc", placeholder: "Bun cha" },
        { name: "description", label: "Mo ta", placeholder: "Mon nuong truyen thong" },
        {
          name: "imageUrl",
          label: "Anh",
          type: "image",
          placeholder: "https://... hoac /uploads/...",
          upload: uploadService.uploadImage
        }
      ]}
    />
  );
}
