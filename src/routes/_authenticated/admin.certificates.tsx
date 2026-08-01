import { createFileRoute } from "@tanstack/react-router";
import { AdminManager } from "@/components/AdminManager";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  component: () => (
    <AdminManager cfg={{
      table: "certificates",
      queryKey: "admin_certificates",
      singular: "certificate",
      plural: "Certificates",
      titleField: "title",
      subtitleField: "issuer",
      imageField: "image_path",
      imageFolder: "certificates",
      fields: [
        { key: "title", label: "Title (EN)" },
        { key: "title_bn", label: "শিরোনাম (BN)" },
        { key: "issuer", label: "Issuer (EN)" },
        { key: "issuer_bn", label: "প্রদানকারী (BN)" },
        { key: "description", label: "Description (EN)", type: "textarea" },
        { key: "description_bn", label: "বিবরণ (BN)", type: "textarea" },
        { key: "issued_on", label: "Issued on", type: "date" },
      ],
    }} />
  ),
});
