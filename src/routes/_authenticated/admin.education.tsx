import { createFileRoute } from "@tanstack/react-router";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/education")({
  component: () => (
    <AdminManager cfg={{
      table: "education_entries",
      queryKey: "admin_education",
      singular: "entry",
      plural: "Education entries",
      titleField: "title",
      subtitleField: "institution",
      fields: [
        { key: "kind", label: "Kind", type: "select", options: ["current", "past", "future", "certificate"] },
        { key: "title", label: "Title" },
        { key: "institution", label: "Institution" },
        { key: "period", label: "Period (e.g. Batch 2026)" },
        { key: "description", label: "Description", type: "textarea" },
      ],
    }} />
  ),
});
