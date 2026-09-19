import {
  BrainCircuit, Building2, Cloud, Code2, Cpu, Database, Factory, GraduationCap, HardHat, HeartPulse, Hotel, Landmark, LifeBuoy, Network, Radar, RadioTower, ScanEye, ShieldCheck, ShoppingBag, Store, Truck, Workflow,
  type LucideProps,
} from "lucide-react";

const icons = { BrainCircuit, Building2, Cloud, Code2, Cpu, Database, Factory, GraduationCap, HardHat, HeartPulse, Hotel, Landmark, LifeBuoy, Network, Radar, RadioTower, ScanEye, ShieldCheck, ShoppingBag, Store, Truck, Workflow };
export type ServiceIconName = keyof typeof icons;
export const serviceIconNames = Object.keys(icons) as ServiceIconName[];

export function ServiceIcon({ name, ...props }: { name?: string } & LucideProps) {
  const Icon = icons[(name || "Cpu") as ServiceIconName] || Cpu;
  return <Icon {...props} />;
}

/** Picks a sensible icon for an industry based on its name. */
export function industryIcon(name: string): ServiceIconName {
  const n = name.toLowerCase();
  if (n.includes("retail")) return "ShoppingBag";
  if (n.includes("hospital") && !n.includes("hospitality")) return "HeartPulse";
  if (n.includes("hospitality") || n.includes("hotel")) return "Hotel";
  if (n.includes("health") || n.includes("clinic") || n.includes("medical")) return "HeartPulse";
  if (n.includes("educat") || n.includes("school") || n.includes("univers")) return "GraduationCap";
  if (n.includes("construct")) return "HardHat";
  if (n.includes("logist") || n.includes("transport")) return "Truck";
  if (n.includes("real estate") || n.includes("property")) return "Building2";
  if (n.includes("manufact") || n.includes("industr")) return "Factory";
  if (n.includes("govern") || n.includes("public")) return "Landmark";
  if (n.includes("sme") || n.includes("small") || n.includes("corporate")) return "Store";
  return "Building2";
}
