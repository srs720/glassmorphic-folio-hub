import { createFileRoute } from "@tanstack/react-router";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/quotes")({
  component: () => (
    <AdminManager cfg={{
      table: "quotes",
      queryKey: "admin_quotes",
      singular: "quote",
      plural: "Quotes",
      titleField: "text",
      subtitleField: "author",
      fields: [
        { key: "text", label: "Quote", type: "textarea" },
        { key: "author", label: "Author (default: Shoibur)" },
        { key: "category", label: "Category (life, work, …)" },
      ],
    }} />
  ),
});
