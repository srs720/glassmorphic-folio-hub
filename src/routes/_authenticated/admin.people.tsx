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
        { key: "name", label: "Name (EN)" },
        { key: "name_bn", label: "নাম (BN)" },
        { key: "relation", label: "Relation (EN)" },
        { key: "relation_bn", label: "সম্পর্ক (BN)" },
        { key: "note", label: "Short note (EN)", type: "textarea" },
        { key: "note_bn", label: "সংক্ষিপ্ত নোট (BN)", type: "textarea" },
      ],
    }} />
  ),
});
