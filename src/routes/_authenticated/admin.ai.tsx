import { createFileRoute } from "@tanstack/react-router";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/ai")({
  component: () => (
    <AdminManager cfg={{
      table: "ai_knowledge_base",
      queryKey: "admin_ai_knowledge",
      singular: "knowledge entry",
      plural: "AI Knowledge Base",
      titleField: "topic",
      subtitleField: "content",
      fields: [
        { key: "topic", label: "Topic" },
        { key: "content", label: "Facts / private knowledge", type: "textarea" },
      ],
    }} />
  ),
});
