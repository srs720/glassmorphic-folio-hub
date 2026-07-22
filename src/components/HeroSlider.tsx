import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedImage } from "@/components/SignedImage";

export function HeroSlider({
  paths,
  alt,
  interval = 3000,
  fallback,
}: {
  paths: string[];
  alt: string;
  interval?: number;
  fallback?: React.ReactNode;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paths.length <= 1) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % paths.length), interval);
    return () => window.clearInterval(id);
  }, [paths.length, interval]);

  if (!paths.length) {
    return <>{fallback}</>;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={paths[i]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <SignedImage
            path={paths[i]}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
