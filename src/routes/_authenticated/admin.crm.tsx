import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/crm")({
  component: CrmPage,
});

function CrmPage() {
  const [tab, setTab] = useState<"profiles" | "events">("profiles");
  const tabBtn = (active: boolean) =>
    `btn-ghost text-sm rounded-xl px-3 py-1.5 ${active ? "bg-white/80 shadow-sm text-foreground" : ""}`;

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <button onClick={() => setTab("profiles")} className={tabBtn(tab === "profiles")}>People</button>
        <button onClick={() => setTab("events")} className={tabBtn(tab === "events")}>Events</button>
      </div>
      {tab === "profiles" ? (
        <AdminManager cfg={{
          table: "crm_profiles",
          queryKey: "admin_crm_profiles",
          singular: "person",
          plural: "CRM People",
          titleField: "name",
          subtitleField: "relation",
          imageField: "photo_path",
          imageFolder: "crm",
          fields: [
            { key: "name", label: "Name (EN)" },
            { key: "name_bn", label: "নাম (BN)" },
            { key: "slug", label: "Profile link (slug)" },
            { key: "relation", label: "Relation (EN)" },
            { key: "relation_bn", label: "সম্পর্ক (BN)" },
            { key: "dob", label: "Date of birth", type: "date" },
            { key: "hobbies", label: "Hobbies (EN)" },
            { key: "hobbies_bn", label: "শখ (BN)" },
            { key: "bio", label: "Bio (EN)", type: "textarea" },
            { key: "bio_bn", label: "বায়ো (BN)", type: "textarea" },
            { key: "is_public", label: "Public profile (shareable)", type: "boolean" },
          ],
        }} />
      ) : (
        <AdminManager cfg={{
          table: "crm_events",
          queryKey: "admin_crm_events",
          singular: "event",
          plural: "CRM Events",
          titleField: "title",
          fields: [
            { key: "title", label: "Title (EN)" },
            { key: "title_bn", label: "শিরোনাম (BN)" },
            { key: "event_date", label: "Event date", type: "date" },
            { key: "event_time", label: "Time", type: "time" },
            { key: "description", label: "Description (EN)", type: "textarea" },
            { key: "description_bn", label: "বিবরণ (BN)", type: "textarea" },
            { key: "is_public", label: "Show on homepage (off = Telegram alarm only)", type: "boolean" },
          ],
        }} />
      )}
    </div>
  );
}
