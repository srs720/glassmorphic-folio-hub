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
        { key: "title", label: "Title (EN)" },
        { key: "title_bn", label: "শিরোনাম (BN)" },
        { key: "institution", label: "Institution (EN)" },
        { key: "institution_bn", label: "প্রতিষ্ঠান (BN)" },
        { key: "period", label: "Period (EN, e.g. Batch 2026)" },
        { key: "period_bn", label: "সময়কাল (BN)" },
        { key: "description", label: "Description (EN)", type: "textarea" },
        { key: "description_bn", label: "বিবরণ (BN)", type: "textarea" },
      ],
    }} />
  ),
});
