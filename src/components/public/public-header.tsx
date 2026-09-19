"use client";

import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BrandMark } from "@/components/brand/logo";
import { ServiceIcon } from "@/components/public/service-icon";

export type NavService = { name: string; slug: string; icon: string; shortDescription: string };

const primaryLinks: Array<[string, string]> = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Solutions", "/solutions"],
  ["Industries", "/industries"],
  ["Projects", "/projects"],
  ["Insights", "/blog"],
  ["Careers", "/careers"],
  ["Contact", "/contact"],
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader({ logoUrl, services, phone }: { logoUrl?: string | null; services: NavService[]; phone?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const megaId = useId();
  const megaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (route change is an external event, not derived state)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); setMegaOpen(false); }, [pathname]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape closes everything; outside click closes mega menu
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); setMegaOpen(false); } };
    const onClick = (event: MouseEvent) => { if (megaRef.current && !megaRef.current.contains(event.target as Node)) setMegaOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onClick); };
  }, []);

  const hoverOpen = () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setMegaOpen(true); };
  const hoverClose = () => { closeTimer.current = window.setTimeout(() => setMegaOpen(false), 140); };

  return (
    <>
      <header className={`public-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
        <div className="site-container nav-inner">
          <BrandMark logoUrl={logoUrl} />

          <nav className="public-nav" aria-label="Main navigation">
            {primaryLinks.map(([label, href]) => {
              if (href === "/services" && services.length > 0) {
                return (
                  <div className="nav-item" key={href} ref={megaRef} onPointerEnter={hoverOpen} onPointerLeave={hoverClose}>
                    <button type="button" className={`nav-link ${isActive(pathname, href) ? "active" : ""}`} aria-expanded={megaOpen} aria-controls={megaId} aria-haspopup="true" onClick={() => setMegaOpen((v) => !v)}>
                      {label} <ChevronDown size={14} />
                    </button>
                    <div id={megaId} className={`mega ${megaOpen ? "is-open" : ""}`} role="region" aria-label="Services menu">
                      <div className="mega-grid">
                        {services.map((service) => (
                          <Link key={service.slug} href={`/services/${service.slug}`} className="mega-item" tabIndex={megaOpen ? 0 : -1}>
                            <i><ServiceIcon name={service.icon} size={17} /></i>
                            <div><b>{service.name}</b><span>{service.shortDescription}</span></div>
                          </Link>
                        ))}
                      </div>
                      <div className="mega-foot">
                        <span>Software, infrastructure and intelligence engineered as one system.</span>
                        <Link href="/services" className="text-link" tabIndex={megaOpen ? 0 : -1} style={{ fontSize: 12.5 }}>All services <ArrowRight size={13} /></Link>
                      </div>
                    </div>
                  </div>
                );
              }
              return <Link key={href} href={href} className={`nav-link ${isActive(pathname, href) ? "active" : ""}`} aria-current={isActive(pathname, href) ? "page" : undefined}>{label}</Link>;
            })}
          </nav>

          <div className="nav-actions">
            <Link className="button button-primary nav-cta" href="/contact">Let’s Talk <ArrowRight size={15} /></Link>
            <button className="mobile-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-drawer" aria-label={open ? "Close navigation" : "Open navigation"}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-drawer" className={`mobile-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile navigation">
          {primaryLinks.map(([label, href]) => {
            if (href === "/services" && services.length > 0) {
              return (
                <div key={href}>
                  <button type="button" className={isActive(pathname, href) ? "active" : ""} aria-expanded={mobileServices} onClick={() => setMobileServices((v) => !v)}>
                    {label} <ChevronDown size={18} style={{ transform: mobileServices ? "rotate(180deg)" : undefined, transition: "transform .2s" }} />
                  </button>
                  {mobileServices && (
                    <div className="mobile-sub">
                      <Link href="/services"><ArrowRight size={14} /> All services</Link>
                      {services.map((service) => <Link key={service.slug} href={`/services/${service.slug}`}><ServiceIcon name={service.icon} size={14} /> {service.name}</Link>)}
                    </div>
                  )}
                </div>
              );
            }
            return <Link key={href} href={href} className={isActive(pathname, href) ? "active" : ""} tabIndex={open ? 0 : -1}>{label} <ArrowRight size={16} style={{ opacity: 0.4 }} /></Link>;
          })}
        </nav>
        <Link className="button button-primary" href="/contact" tabIndex={open ? 0 : -1}>Let’s Talk <ArrowRight size={15} /></Link>
        {phone && <div className="mobile-contact"><span>Talk to our team</span><a href={`tel:${phone.replace(/[^\d+]/g, "")}`} tabIndex={open ? 0 : -1}><Phone size={13} style={{ display: "inline", marginRight: 8 }} />{phone}</a></div>}
      </div>
    </>
  );
}
