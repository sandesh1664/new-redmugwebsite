"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export type SceneVariant = "network" | "shield" | "neural";

const BLUE = "#4eacf1";
const BLUE_DEEP = "#0f6fb5";
const RED = "#e0313f";
const INK = "#0b1b2e";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

/** Deterministic pseudo-random so the scene is identical across renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fibonacciSphere(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return points;
}

/** Rotates the whole scene gently toward the pointer; no-ops when pointer is idle. */
function ParallaxRig({ children, strength = 0.18 }: { children: React.ReactNode; strength?: number }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((_, delta) => {
    if (!group.current) return;
    const targetX = pointer.y * -strength;
    const targetY = pointer.x * strength;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3, delta);
  });
  return <group ref={group}>{children}</group>;
}

function Particles({ count = 320, spread = 6, seed = 7 }: { count?: number; spread?: number; seed?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = mulberry32(seed);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * spread;
      arr[i * 3 + 1] = (rand() - 0.5) * spread;
      arr[i * 3 + 2] = (rand() - 0.5) * spread * 0.6;
    }
    return arr;
  }, [count, spread, seed]);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.02; });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.022} color={BLUE} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Variant: NETWORK (hero)                                             */
/* ------------------------------------------------------------------ */

function NetworkGlobe() {
  const globe = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => fibonacciSphere(56, 1.62), []);
  const links = useMemo(() => {
    const out: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 0.72) out.push([nodes[i], nodes[j]]);
      }
    }
    return out;
  }, [nodes]);
  const hubs = useMemo(() => [4, 17, 29, 41, 50], []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (globe.current) globe.current.rotation.y += delta * 0.12;
    if (ringA.current) ringA.current.rotation.z += delta * 0.18;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.12;
    if (pulse.current) {
      const s = 1.68 + ((t * 0.35) % 1) * 0.9;
      pulse.current.scale.setScalar(s);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = 0.22 * (1 - ((t * 0.35) % 1));
    }
  });

  return (
    <group>
      <group ref={globe}>
        {/* Inner dark planet with subtle emissive so wireframe reads as depth */}
        <mesh>
          <sphereGeometry args={[1.5, 48, 48]} />
          <meshStandardMaterial color={INK} emissive={BLUE_DEEP} emissiveIntensity={0.16} roughness={0.85} metalness={0.2} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1.6, 2]} />
          <meshBasicMaterial color={BLUE_DEEP} wireframe transparent opacity={0.22} />
        </mesh>
        {/* Node mesh */}
        {nodes.map((p, i) => {
          const hub = hubs.includes(i);
          return (
            <mesh key={i} position={p}>
              <sphereGeometry args={[hub ? 0.05 : 0.024, 10, 10]} />
              <meshBasicMaterial color={hub ? RED : BLUE} />
            </mesh>
          );
        })}
        {links.map(([a, b], i) => (
          <Line key={i} points={[a, b]} color={BLUE} transparent opacity={0.35} lineWidth={0.8} />
        ))}
      </group>

      {/* Outward pulse */}
      <mesh ref={pulse}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.2} wireframe />
      </mesh>

      {/* Orbit rings */}
      <mesh ref={ringA} rotation={[Math.PI / 2.6, 0.2, 0]}>
        <torusGeometry args={[2.25, 0.006, 8, 160]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.55} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 1.7, -0.5, 0]}>
        <torusGeometry args={[2.6, 0.004, 8, 160]} />
        <meshBasicMaterial color={RED} transparent opacity={0.45} />
      </mesh>

      {/* Satellite infrastructure blocks (servers / edge devices) */}
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
        <ServerStack position={[2.55, 0.9, -0.3]} />
      </Float>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.5}>
        <ServerStack position={[-2.5, -0.9, 0.2]} scale={0.8} />
      </Float>
      <Float speed={1.7} rotationIntensity={0.4} floatIntensity={0.7}>
        <mesh position={[-2.1, 1.5, -0.6]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

function ServerStack({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, i * 0.17 - 0.17, 0]}>
          <mesh>
            <boxGeometry args={[0.6, 0.13, 0.36]} />
            <meshStandardMaterial color="#132a44" metalness={0.7} roughness={0.35} emissive={BLUE_DEEP} emissiveIntensity={0.1} />
          </mesh>
          <mesh position={[0.22, 0, 0.185]}>
            <boxGeometry args={[0.04, 0.04, 0.01]} />
            <meshBasicMaterial color={i === 1 ? RED : "#3bc88d"} />
          </mesh>
        </group>
      ))}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.62, 0.53, 0.38)]} />
        <lineBasicMaterial color={BLUE} transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Variant: SHIELD (security)                                          */
/* ------------------------------------------------------------------ */

function shieldShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 1.35);
  s.bezierCurveTo(0.7, 1.2, 1.05, 1.0, 1.15, 0.85);
  s.lineTo(1.15, -0.1);
  s.bezierCurveTo(1.15, -0.8, 0.55, -1.3, 0, -1.55);
  s.bezierCurveTo(-0.55, -1.3, -1.15, -0.8, -1.15, -0.1);
  s.lineTo(-1.15, 0.85);
  s.bezierCurveTo(-1.05, 1.0, -0.7, 1.2, 0, 1.35);
  return s;
}

function Shield() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const scan = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shieldShape(), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3 });
    g.center();
    return g;
  }, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 30), [geometry]);
  const nodes = useMemo(() => fibonacciSphere(36, 2.15), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = Math.sin(t * 0.4) * 0.35;
    if (ring.current) ring.current.rotation.z += delta * 0.25;
    if (scan.current) scan.current.position.y = Math.sin(t * 0.9) * 1.25;
  });

  return (
    <group>
      <group ref={group}>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#0e2440" metalness={0.75} roughness={0.28} emissive={BLUE_DEEP} emissiveIntensity={0.18} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={BLUE} transparent opacity={0.7} />
        </lineSegments>
        {/* Lock core */}
        <mesh position={[0, -0.05, 0.22]}>
          <torusGeometry args={[0.3, 0.06, 12, 40, Math.PI]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.5} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.42, 0.22]}>
          <boxGeometry args={[0.7, 0.5, 0.14]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.35} metalness={0.5} roughness={0.35} />
        </mesh>
        {/* Scan plane */}
        <mesh ref={scan} position={[0, 0, 0.3]}>
          <planeGeometry args={[2.6, 0.02]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.8} />
        </mesh>
      </group>
      <mesh ref={ring} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.25, 0.005, 8, 140]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.5} />
      </mesh>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color={i % 9 === 0 ? RED : BLUE} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Variant: NEURAL (AI)                                                */
/* ------------------------------------------------------------------ */

function NeuralCore() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const layers = useMemo(() => {
    const rand = mulberry32(21);
    const cols = [-2.1, -0.7, 0.7, 2.1];
    const counts = [4, 6, 6, 3];
    return cols.map((x, li) => Array.from({ length: counts[li] }, (_, i) => {
      const y = (i - (counts[li] - 1) / 2) * 0.55;
      return new THREE.Vector3(x, y, (rand() - 0.5) * 0.5);
    }));
  }, []);
  const links = useMemo(() => {
    const out: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (let l = 0; l < layers.length - 1; l++) for (const a of layers[l]) for (const b of layers[l + 1]) out.push([a, b]);
    return out;
  }, [layers]);
  const signals = useMemo(() => {
    const rand = mulberry32(3);
    return Array.from({ length: 14 }, () => ({ link: Math.floor(rand() * links.length), offset: rand(), speed: 0.25 + rand() * 0.35 }));
  }, [links]);
  const signalRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = Math.sin(t * 0.3) * 0.25;
    if (core.current) { const s = 1 + Math.sin(t * 2) * 0.05; core.current.scale.setScalar(s); core.current.rotation.x += delta * 0.4; core.current.rotation.y += delta * 0.3; }
    signals.forEach((sig, i) => {
      const m = signalRefs.current[i]; if (!m) return;
      const [a, b] = links[sig.link];
      const p = (t * sig.speed + sig.offset) % 1;
      m.position.lerpVectors(a, b, p);
    });
  });

  return (
    <group ref={group}>
      {links.map(([a, b], i) => <Line key={i} points={[a, b]} color={BLUE} transparent opacity={0.16} lineWidth={0.6} />)}
      {layers.flat().map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.7} />
        </mesh>
      ))}
      {signals.map((_, i) => (
        <mesh key={i} ref={(el) => { signalRefs.current[i] = el; }}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={i % 4 === 0 ? RED : "#9fd2f7"} />
        </mesh>
      ))}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh ref={core} position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial color="#132a44" emissive={RED} emissiveIntensity={0.45} metalness={0.6} roughness={0.3} wireframe />
        </mesh>
      </Float>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas wrapper                                                      */
/* ------------------------------------------------------------------ */

export default function TechScene({ variant = "network", className }: { variant?: SceneVariant; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // Pause the render loop when the scene scrolls out of view (saves GPU/battery).
  useEffect(() => {
    const el = host.current; if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const camera = variant === "neural" ? { position: [0, 0, 5.2] as [number, number, number], fov: 42 } : { position: [0, 0, 6.2] as [number, number, number], fov: 40 };

  return (
    <div ref={host} className={className ?? "scene-canvas"} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={camera} frameloop={active ? "always" : "never"} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 5, 6]} intensity={1.1} color="#cfe6ff" />
        <pointLight position={[-4, -2, 3]} intensity={1.4} color={BLUE} />
        <pointLight position={[3, -3, -2]} intensity={0.8} color={RED} />
        <ParallaxRig strength={variant === "network" ? 0.2 : 0.12}>
          {variant === "network" && <NetworkGlobe />}
          {variant === "shield" && <Shield />}
          {variant === "neural" && <NeuralCore />}
          <Particles count={variant === "network" ? 340 : 180} seed={variant === "shield" ? 11 : variant === "neural" ? 5 : 7} />
        </ParallaxRig>
      </Canvas>
    </div>
  );
}
