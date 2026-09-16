import { ImageResponse } from "next/og";

/**
 * Social share card generated deterministically from RedMug brand tokens at
 * build time. This replaces an earlier AI-generated approximation so the
 * colours, proportions and lockup are exact rather than inferred.
 */
export const alt = "RedMug IT Solution Co. L.L.C — Technology, Dubai, UAE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#07101F", padding: "0 96px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#C8202F,#0F6FB5)" }} />

        {/* Monogram badge */}
        <div style={{ width: 220, height: 220, borderRadius: 9999, background: "linear-gradient(135deg,#63B8F0 0%,#1379C6 45%,#083E77 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 14, right: 26, width: 74, height: 40, borderRadius: 9999, background: "rgba(255,255,255,0.18)", transform: "rotate(-24deg)" }} />
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span style={{ color: "#FFFFFF", fontSize: 132, fontWeight: 700, lineHeight: 1, letterSpacing: "-6px" }}>P</span>
            <span style={{ color: "#C8202F", fontSize: 96, fontWeight: 700, lineHeight: 1, marginLeft: -22, marginBottom: -6 }}>M</span>
          </div>
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 58 }}>
          <span style={{ color: "#F0404A", fontSize: 104, fontWeight: 700, lineHeight: 1, letterSpacing: "2px" }}>REDMUG</span>
          <span style={{ color: "#A9C0D6", fontSize: 34, fontWeight: 600, letterSpacing: "7px", marginTop: 20 }}>IT SOLUTION CO.L.L.C</span>
          <div style={{ width: 300, height: 3, background: "#C8202F", marginTop: 34 }} />
          <span style={{ color: "#7E94AA", fontSize: 26, marginTop: 26 }}>Technology · Software · Infrastructure · Dubai, UAE</span>
        </div>

        <div style={{ position: "absolute", bottom: 52, right: 96, color: "#4E6E8C", fontSize: 24, display: "flex" }}>Established 2019</div>
      </div>
    ),
    size,
  );
}
