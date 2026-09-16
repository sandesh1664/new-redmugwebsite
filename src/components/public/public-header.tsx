"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand/logo";

const links = [
  ["Services", "/services"], ["Solutions", "/solutions"], ["Industries", "/industries"], ["Projects", "/projects"], ["Company", "/about"], ["Insights", "/blog"],
];

export function PublicHeader({ logoUrl }: { logoUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="public-header">
      <div className="site-container nav-inner">
        <BrandMark logoUrl={logoUrl} />
        <nav className={open ? "public-nav is-open" : "public-nav"} aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname.startsWith(href) ? "active" : ""}>{label}</Link>)}
          <Link className="nav-contact" href="/contact" onClick={() => setOpen(false)}>Start a project <span>↗</span></Link>
        </nav>
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}
