"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SceneVariant } from "./tech-scene";

const TechScene = dynamic(() => import("./tech-scene"), { ssr: false });

type Capability = "pending" | "webgl" | "fallback";

function detectCapability(): Capability {
  if (typeof window === "undefined") return "pending";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "fallback";
  // Phones get the lightweight CSS visual; tablets and up get WebGL.
  if (window.matchMedia("(max-width: 640px)").matches) return "fallback";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "fallback";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 2) return "fallback";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return gl ? "webgl" : "fallback";
  } catch {
    return "fallback";
  }
}

/**
 * Mounts a 3D scene only when the browser can afford it and the element is near
 * the viewport. Everything else — reduced motion, small screens, no WebGL, slow
 * connections — receives the supplied static fallback instead.
 */
export function SceneLoader({ variant, fallback, className }: { variant: SceneVariant; fallback: ReactNode; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [capability, setCapability] = useState<Capability>("pending");
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = host.current; if (!el) return;
    // Capability is probed lazily, only once the scene is near the viewport.
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setCapability(detectCapability()); setNear(true); io.disconnect(); } }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showScene = capability === "webgl" && near;
  return (
    <div ref={host} className={className ?? "scene-frame"} style={{ position: "absolute", inset: 0 }}>
      {showScene ? <TechScene variant={variant} /> : <div className="scene-fallback">{fallback}</div>}
    </div>
  );
}
