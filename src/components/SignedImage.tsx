import { useEffect, useState } from "react";
import { getSignedUrl } from "@/lib/portfolio";

export function SignedImage({
  path,
  alt,
  className,
  priority = false,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    setUrl(null);
    setLoadedUrl(null);
    setResolved(false);
    setFailedUrl(null);
    getSignedUrl(path).then((u) => {
      if (!mounted) return;
      setUrl(u);
      setResolved(true);
    });
    return () => {
      mounted = false;
    };
  }, [path]);

  if (!path) {
    return (
      <div
        className={
          "flex items-center justify-center bg-gradient-to-br from-mint/40 to-emerald-soft/30 text-emerald-900/40 text-sm " +
          (className ?? "")
        }
      >
        No image
      </div>
    );
  }
  if (!url) {
    return (
      <div
        aria-hidden="true"
        className={`${className ?? ""} bg-surface-2 ${resolved ? "" : "animate-pulse"}`}
      />
    );
  }
  if (failedUrl === url) return <div aria-hidden="true" className={`${className ?? ""} bg-surface-2`} />;
  const seoAlt = alt.startsWith("Shoibur Rahman - ") ? alt : `Shoibur Rahman - ${alt.replace(/^(Shoibur Rahman|শোয়াইবুর রহমান)\s*[—-]\s*/, "")}`;
  const isLoaded = loadedUrl === url;
  return (
    <img
      src={url}
      alt={seoAlt}
      className={`${className ?? ""} bg-surface-2 transition-opacity duration-300 ${isLoaded ? "opacity-100" : "animate-pulse opacity-0"}`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onLoad={() => setLoadedUrl(url)}
      onError={() => {
        setFailedUrl(url);
        setLoadedUrl(url);
      }}
    />
  );
}
