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
        { key: "title", label: "Title (EN)" },
        { key: "title_bn", label: "শিরোনাম (BN)" },
        { key: "location", label: "Location (EN)" },
        { key: "location_bn", label: "স্থান (BN)" },
        { key: "taken_on", label: "Date", type: "date" },
        { key: "story", label: "Story (EN)", type: "textarea" },
        { key: "story_bn", label: "গল্প (BN)", type: "textarea" },
      ],
    }} />
  ),
});
