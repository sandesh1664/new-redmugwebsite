import { BrainCircuit, Cloud, Code2, Cpu, LifeBuoy, Network, RadioTower, ScanEye, Workflow, ShieldCheck, Database, type LucideProps } from "lucide-react";

const icons = { BrainCircuit, Cloud, Code2, Cpu, LifeBuoy, Network, RadioTower, ScanEye, Workflow, ShieldCheck, Database };
export function ServiceIcon({ name, ...props }: { name?: string } & LucideProps) {
  const Icon = icons[(name || "Cpu") as keyof typeof icons] || Cpu;
  return <Icon {...props} />;
}
