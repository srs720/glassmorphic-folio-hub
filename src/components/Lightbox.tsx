import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SignedImage } from "@/components/SignedImage";
import { useLang } from "@/lib/i18n";

export function Lightbox({
  path,
  alt,
  caption,
  onClose,
}: {
  path: string | null;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  const { t } = useLang();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {path && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/70 backdrop-blur-sm p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label={t("close")}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition"
            >
              <X className="h-4 w-4" />
            </button>
            <SignedImage path={path} alt={alt} className="max-h-[76vh] w-full object-contain bg-surface-2" />
            {caption && (
              <div className="px-5 py-4">
                <p className="font-display text-xl">{alt}</p>
                <p className="text-sm text-muted-foreground mt-1">{caption}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
