export function EcosystemVisual() {
  return (
    <div className="tech-visual" aria-label="RedMug technology ecosystem: software, AI, IoT, cloud, network and security">
      <span className="visual-coord top">DXB / SYSTEM 2019</span><span className="visual-coord bottom">CONNECTED ARCHITECTURE / 06</span>
      <div className="data-line" />
      {["AI", "SOFTWARE", "IoT", "CLOUD", "NETWORK", "SECURITY"].map((item) => <div className="orbit-node" key={item}>{item}</div>)}
      <div className="core-orbit"><div className="core-label"><b>REDMUG</b><span>TECH CORE</span></div></div>
    </div>
  );
}

export function TechnologyFlow() {
  const steps = ["DEVICE", "NETWORK", "CLOUD", "DATA", "AI", "INTELLIGENCE", "BUSINESS ACTION"];
  return <div className="ecosystem-flow">{steps.map((step, index) => <div className="flow-step" key={step}><small>0{index + 1} / SIGNAL</small><i /><b>{step}</b>{index < steps.length - 1 && <span className="flow-arrow" />}</div>)}</div>;
}
