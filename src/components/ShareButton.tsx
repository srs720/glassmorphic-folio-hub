import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

type Props = {
  title: string;
  text?: string;
  /** Absolute or root-relative URL to share. */
  url: string;
  className?: string;
  label?: boolean;
};

export function ShareButton({ title, text, url, className = "", label = false }: Props) {
  const { t } = useLang();

  async function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const absolute = url.startsWith("http")
      ? url
      : typeof window !== "undefined"
        ? `${window.location.origin}${url}`
        : url;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text: text || title, url: absolute });
        return;
      }
      await navigator.clipboard.writeText(absolute);
      toast.success(t("link_copied"));
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(absolute);
        toast.success(t("link_copied"));
      } catch {
        toast.error(t("share_failed"));
      }
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={t("share")}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-foreground/80 shadow-sm hover:bg-surface-2 hover:text-foreground transition ${className}`}
    >
      <Share2 className="h-3.5 w-3.5" />
      {label && <span>{t("share")}</span>}
    </button>
  );
}
