import { createFileRoute } from "@tanstack/react-router";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/foods")({
  component: () => (
    <AdminManager cfg={{
      table: "foods",
      queryKey: "admin_foods",
      singular: "food",
      plural: "Foods",
      titleField: "name",
      subtitleField: "cuisine",
      imageField: "image_path",
      imageFolder: "foods",
      fields: [
        { key: "name", label: "Name" },
        { key: "cuisine", label: "Cuisine" },
        { key: "rating", label: "Rating (1-5)", type: "number", min: 1, max: 5 },
        { key: "review", label: "Review", type: "textarea" },
      ],
    }} />
  ),
});
