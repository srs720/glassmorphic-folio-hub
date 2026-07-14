import { useEffect, useState } from "react";
import { getSignedUrl } from "@/lib/portfolio";

export function SignedImage({
  path,
  alt,
  className,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    getSignedUrl(path).then((u) => mounted && setUrl(u));
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
  if (!url) return <div className={"animate-pulse bg-white/40 " + (className ?? "")} />;
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
