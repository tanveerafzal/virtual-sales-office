"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useMemo } from "react";
import type { TenantAsset, TenantConfig } from "@/tenants/types";

type Props = {
  tenant: TenantConfig;
  asset: TenantAsset | undefined;
  viewLabel: string;
};

function PlaceholderMassing({ label }: { label: string }) {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[2.4, 1.8, 1.6]} />
        <meshStandardMaterial color="#4a737e" roughness={0.65} metalness={0.1} />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <boxGeometry args={[2.5, 0.5, 1.7]} />
        <meshStandardMaterial color="#c5a46a" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#1a2a2e" roughness={0.95} />
      </mesh>
      <Html center position={[0, 3.1, 0]} distanceFactor={8}>
        <div className="rounded-sm border border-white/20 bg-black/70 px-3 py-2 text-center text-[11px] tracking-wide text-white/90 backdrop-blur-sm">
          <p className="font-medium">3D placeholder</p>
          <p className="mt-0.5 max-w-[12rem] text-white/60">{label}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#c5a46a]">
            Drop GLB when ready
          </p>
        </div>
      </Html>
    </group>
  );
}

function ReadyModel({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={cloned} />;
}

function SceneContent({ asset }: { asset: TenantAsset | undefined }) {
  if (!asset || !asset.ready) {
    return (
      <PlaceholderMassing
        label={asset?.label ?? "No asset selected — assign a model elevation"}
      />
    );
  }

  return (
    <Suspense fallback={<PlaceholderMassing label={`Loading ${asset.label}…`} />}>
      <ReadyModel src={asset.src} />
      <ContactShadows opacity={0.35} scale={12} blur={2.5} far={6} />
    </Suspense>
  );
}

export function ExploreCanvas({ tenant, asset, viewLabel }: Props) {
  return (
    <div className="relative h-[min(72vh,720px)] w-full overflow-hidden bg-[var(--t-surface)]">
      <Canvas
        shadows
        camera={{ position: [4.2, 2.4, 5.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[tenant.theme.surface]} />
        <ambientLight intensity={0.45} />
        <directionalLight
          castShadow
          position={[5, 8, 4]}
          intensity={1.15}
          shadow-mapSize={[1024, 1024]}
        />
        <SceneContent asset={asset} />
        <Environment preset="city" environmentIntensity={0.35} />
        <OrbitControls
          makeDefault
          enablePan={false}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={3}
          maxDistance={12}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 md:p-6">
        <div className="pointer-events-auto max-w-sm border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--t-gold)]">
            {viewLabel}
          </p>
          <p className="mt-1 text-sm text-[var(--t-fg)]">
            {asset?.label ?? "Select a model"}
          </p>
          <p className="mt-1 text-xs text-[var(--t-muted)]">
            {asset?.ready
              ? `Loaded from ${asset.src}`
              : "Human team owns exterior / interior GLBs. Software wires this slot."}
          </p>
        </div>
      </div>
    </div>
  );
}
