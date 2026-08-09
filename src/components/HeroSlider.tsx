import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSignedUrl } from "@/lib/portfolio";

/**
 * Auto-playing hero background.
 * All slides are resolved to signed URLs once and preloaded into the browser
 * cache, so the crossfade never waits on a network round-trip.
 */
export function HeroSlider({
  paths,
  alt,
  interval = 5000,
  fallback,
}: {
  paths: string[];
  alt: string;
  interval?: number;
  fallback?: React.ReactNode;
}) {
  const key = useMemo(() => paths.join("|"), [paths]);
  const [urls, setUrls] = useState<string[]>([]);
  const [i, setI] = useState(0);

  // Resolve + preload every slide up front.
  useEffect(() => {
    let cancelled = false;
    if (!paths.length) {
      setUrls([]);
      return;
    }
    Promise.all(paths.map((p) => getSignedUrl(p))).then((resolved) => {
      if (cancelled) return;
      const list = resolved.filter(Boolean) as string[];
      list.forEach((src) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      });
      setUrls(list);
      setI(0);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (urls.length <= 1) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % urls.length), interval);
    return () => window.clearInterval(id);
  }, [urls.length, interval]);

  if (!paths.length || (!urls.length && fallback)) return <>{fallback}</>;

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-2">
      <AnimatePresence initial={false}>
        <motion.img
          key={urls[i] ?? i}
          src={urls[i]}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover will-change-[opacity]"
        />
      </AnimatePresence>
    </div>
  );
}
