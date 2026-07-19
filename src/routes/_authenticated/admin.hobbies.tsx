import { createFileRoute } from "@tanstack/react-router";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/hobbies")({
  component: () => (
    <AdminManager cfg={{
      table: "hobbies",
      queryKey: "admin_hobbies",
      singular: "hobby",
      plural: "Hobbies",
      titleField: "title",
      imageField: "image_path",
      imageFolder: "hobbies",
      fields: [
        { key: "title", label: "Title" },
        { key: "description", label: "Description", type: "textarea" },
      ],
    }} />
  ),
});
