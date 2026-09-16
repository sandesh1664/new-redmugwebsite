import Link from "next/link";
import { useId } from "react";

/**
 * Faithful vector reconstruction of the RedMug IT Solution Co. L.L.C. monogram.
 * Glossy blue sphere, honeycomb hexagon cluster, white "P" with the red "M"
 * interlocking from the right and descending below the bowl.
 *
 * The gradient id is generated per instance: a hardcoded id would be duplicated
 * across every logo on the page, which is invalid HTML and can make the browser
 * resolve an unrelated (or removed) gradient.
 */
const HEX_CLUSTER: Array<{ points: string; opacity: number; outline?: boolean }> = [
  { points: "34,20 45.26,26.5 45.26,39.5 34,46 22.74,39.5 22.74,26.5", opacity: 1 },
  { points: "52,13.5 59.36,17.75 59.36,26.25 52,30.5 44.64,26.25 44.64,17.75", opacity: 1 },
  { points: "22,42.5 28.5,46.25 28.5,53.75 22,57.5 15.5,53.75 15.5,46.25", opacity: 0.9 },
  { points: "41,46 46.2,49 46.2,55 41,58 35.8,55 35.8,49", opacity: 0.55 },
  { points: "30,10.5 33.9,12.75 33.9,17.25 30,19.5 26.1,17.25 26.1,12.75", opacity: 0.7 },
  { points: "50,31 54.33,33.5 54.33,38.5 50,41 45.67,38.5 45.67,33.5", opacity: 0.85, outline: true },
];

export function RedMugMark({ size = 42 }: { size?: number }) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="RedMug IT Solution" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <radialGradient id={gradientId} cx="0.34" cy="0.24" r="0.98">
          <stop offset="0" stopColor="#63B8F0" />
          <stop offset="0.42" stopColor="#1379C6" />
          <stop offset="1" stopColor="#083E77" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill={`url(#${gradientId})`} />
      <ellipse cx="72" cy="30" rx="27" ry="17" fill="#FFFFFF" opacity="0.16" transform="rotate(-24 72 30)" />
      <circle cx="60" cy="60" r="59" fill="none" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1.5" />
      <g fill="#FFFFFF">
        {HEX_CLUSTER.map((hex, index) =>
          hex.outline ? (
            <polygon key={index} points={hex.points} fill="none" stroke="#FFFFFF" strokeWidth="2.2" opacity={hex.opacity} />
          ) : (
            <polygon key={index} points={hex.points} opacity={hex.opacity} />
          ),
        )}
      </g>
      <g fill="#FFFFFF">
        <rect x="46" y="34" width="15" height="64" rx="2" />
      </g>
      <path d="M61 41.5 H68 A13.5 13.5 0 0 1 68 68.5 H61" fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinejoin="round" />
      <path d="M68 98 V58 L82 77 L96 58 V98 H87.5 V75 L82 83.5 L76.5 75 V98 Z" fill="#C8202F" />
    </svg>
  );
}

/**
 * Renders the brand lockup. When an administrator uploads the official logo in
 * Admin → Site Settings, that artwork is used everywhere; the vector mark is the
 * fallback so the brand is never broken.
 */
export function BrandMark({
  compact = false,
  href = "/",
  size = 42,
  logoUrl,
}: {
  compact?: boolean;
  href?: string;
  size?: number;
  logoUrl?: string | null;
}) {
  return (
    <Link href={href} className="brand" aria-label="RedMug IT Solution home">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- CMS-supplied artwork may be any uploaded format.
        <img src={logoUrl} alt="RedMug IT Solution logo" width={size} height={size} style={{ display: "block", flexShrink: 0, objectFit: "contain" }} />
      ) : (
        <RedMugMark size={size} />
      )}
      {!compact && (
        <span className="brand-copy">
          <strong>REDMUG</strong>
          <small>IT SOLUTION CO.L.L.C</small>
        </span>
      )}
    </Link>
  );
}
