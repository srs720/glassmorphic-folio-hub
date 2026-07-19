import { createFileRoute } from "@tanstack/react-router";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/people")({
  component: () => (
    <AdminManager cfg={{
      table: "people",
      queryKey: "admin_people",
      singular: "person",
      plural: "People",
      titleField: "name",
      subtitleField: "relation",
      imageField: "image_path",
      imageFolder: "people",
      fields: [
        { key: "category", label: "Category", type: "select", options: ["family", "teacher", "friend"] },
        { key: "name", label: "Name" },
        { key: "relation", label: "Relation" },
        { key: "note", label: "Short note", type: "textarea" },
      ],
    }} />
  ),
});
