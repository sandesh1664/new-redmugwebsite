"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * One IntersectionObserver for every `.reveal` element on the page, including
 * elements added later by client navigation. Lets server components opt in with
 * a class name instead of each needing a client wrapper.
 */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) { document.querySelectorAll(".reveal, .reveal-scale").forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    const observeAll = () => document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible), .reveal-scale:not(.is-visible)").forEach((el) => io.observe(el));
    // Streaming SSR hydrates in chunks after mount; mutating classes before a chunk
    // hydrates causes attribute mismatches. Start once the document has settled.
    let timer = 0;
    const start = () => { observeAll(); timer = window.setInterval(observeAll, 1200); };
    if (document.readyState === "complete") { timer = window.setTimeout(start, 50); } else window.addEventListener("load", start, { once: true });
    return () => { window.removeEventListener("load", start); window.clearTimeout(timer); window.clearInterval(timer); io.disconnect(); };
  }, []);
  return null;
}

/** Convenience wrapper that renders a `.reveal` element with an optional stagger delay. */
export function Reveal({ children, as: Tag = "div", className = "", delay = 0, style }: { children: ReactNode; as?: "div" | "section" | "article" | "li" | "span"; className?: string; delay?: number; style?: CSSProperties }) {
  const Component = Tag as "div";
  return <Component className={`reveal ${className}`} style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}>{children}</Component>;
}

/** Animates a number from 0 to `value` when visible. Suffix/prefix stay static. */
export function Counter({ value, prefix = "", suffix = "", duration = 1400 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Server + first paint always show the real value; the count-up is a progressive enhancement.
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const el = ref.current; if (!el || value === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span ref={ref}>{prefix}{display.toLocaleString("en-AE")}{suffix}</span>;
}

/** Thin brand-gradient bar showing page scroll progress. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--progress", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}

/**
 * Tracks the pointer over `.tech-card` elements and exposes --mx/--my so CSS can
 * render a spotlight. One delegated listener for the whole page.
 */
export function CardSpotlight() {
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const onMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(".tech-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
