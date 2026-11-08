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

  // Resolve slide links once, but only preload the currently visible image.
  useEffect(() => {
    let cancelled = false;
    if (!paths.length) {
      setUrls([]);
      return;
    }
    const resolveSlides = async () => {
      const first = await getSignedUrl(paths[0]);
      if (cancelled) return;
      const initial = first ? [first] : [];
      setUrls(initial);
      setI(0);
      if (first) {
        const img = new Image();
        img.decoding = "async";
        img.fetchPriority = "high";
        img.src = first;
      }

      const rest = await Promise.all(paths.slice(1).map((path) => getSignedUrl(path)));
      if (cancelled) return;
      setUrls([...initial, ...rest.filter((url): url is string => Boolean(url))]);
    };
    void resolveSlides();
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

  useEffect(() => {
    if (urls.length <= 1) return;
    const next = urls[(i + 1) % urls.length];
    if (!next) return;
    const img = new Image();
    img.decoding = "async";
    img.src = next;
  }, [i, urls]);

  if (!paths.length || (!urls.length && fallback)) return <>{fallback}</>;

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-2">
      <AnimatePresence initial={false}>
        <motion.img
          key={urls[i] ?? i}
          src={urls[i]}
          alt={alt.startsWith("Shoibur Rahman - ") ? alt : `Shoibur Rahman - ${alt.replace(/^(Shoibur Rahman|শোয়াইবুর রহমান)\s*[—-]\s*/, "")}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover will-change-[opacity] bg-surface-2"
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "auto"}
          decoding="async"
        />
      </AnimatePresence>
    </div>
  );
}
