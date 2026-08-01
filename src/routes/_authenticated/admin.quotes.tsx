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
        { key: "text", label: "Quote (EN)", type: "textarea" },
        { key: "text_bn", label: "উক্তি (BN)", type: "textarea" },
        { key: "author", label: "Author (EN)" },
        { key: "author_bn", label: "লেখক (BN)" },
        { key: "category", label: "Category (EN)" },
        { key: "category_bn", label: "বিভাগ (BN)" },
      ],
    }} />
  ),
});
