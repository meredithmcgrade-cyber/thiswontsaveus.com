"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";

/**
 * Lenis smooth scrolling for the whole document. Disabled automatically when
 * the visitor prefers reduced motion so the page behaves like a normal site.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        duration: 1.1,
        smoothWheel: true,
        anchors: { offset: -120 },
      }}
    >
      {children}
    </ReactLenis>
  );
}
