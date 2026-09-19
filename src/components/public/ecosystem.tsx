import { SceneLoader } from "@/components/three/scene-loader";

/** Lightweight CSS visual used when WebGL is unavailable, on phones, or with reduced motion. */
export function CoreFallback({ label = "TECH CORE" }: { label?: string }) {
  return (
    <div className="core-orbit" aria-hidden="true">
      <div className="core-label"><b>REDMUG</b><span>{label}</span></div>
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="hero-visual" role="img" aria-label="Interactive visualization of RedMug's connected technology infrastructure: network nodes, servers and security systems">
      <SceneLoader variant="network" fallback={<CoreFallback />} />
      <span className="hud tl">DXB · SYSTEM 2019</span>
      <span className="hud tr">NETWORK TOPOLOGY<br />LIVE RENDER</span>
      <span className="hud bl">CONNECTED ARCHITECTURE / 06</span>
      <span className="hud br">LAT 25.27 · LON 55.33</span>
      <div className="hud-card a"><small>Infrastructure</small><b><i /> Network online</b></div>
      <div className="hud-card b"><small>Security</small><b><i /> Perimeter monitored</b></div>
      <div className="hud-card c"><small>Cloud</small><b><i /> Backups verified</b></div>
      <div className="hud-card d"><small>Intelligence</small><b><i /> Data pipeline active</b></div>
    </div>
  );
}

export function TechnologyFlow() {
  const steps = ["DEVICE", "NETWORK", "CLOUD", "DATA", "AI", "INTELLIGENCE", "BUSINESS ACTION"];
  return (
    <div className="ecosystem-flow" role="list" aria-label="Signal flow from device to business action">
      {steps.map((step, index) => (
        <div className="flow-step" key={step} role="listitem">
          <small>0{index + 1} / SIGNAL</small><i /><b>{step}</b>
          {index < steps.length - 1 && <span className="flow-arrow" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}
