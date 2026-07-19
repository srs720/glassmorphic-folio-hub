import { createFileRoute } from "@tanstack/react-router";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/memories")({
  component: () => (
    <AdminManager cfg={{
      table: "memories",
      queryKey: "admin_memories",
      singular: "memory",
      plural: "Memories",
      titleField: "title",
      subtitleField: "location",
      imageField: "image_path",
      imageFolder: "memories",
      fields: [
        { key: "title", label: "Title" },
        { key: "location", label: "Location" },
        { key: "taken_on", label: "Date", type: "date" },
        { key: "story", label: "Story", type: "textarea" },
      ],
    }} />
  ),
});
