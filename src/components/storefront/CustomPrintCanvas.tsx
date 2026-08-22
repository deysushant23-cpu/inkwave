'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, Decal, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GraphicLayer } from '@/lib/customPrintHelpers';

// Pre-load the GLB model locally
useGLTF.preload('/shirt.glb');

/* ── Individual Decal Layer Component ──────────────────────────────────── */
function DecalItem({ 
  textureUrl, 
  xOffset = 0, 
  yOffset = 38, 
  scaleValue = 45, 
  rotateValue = 0, 
  side = 'front' 
}: { 
  textureUrl: string; 
  xOffset?: number; 
  yOffset?: number; 
  scaleValue?: number; 
  rotateValue?: number; 
  side?: 'front' | 'back'; 
}) {
  const decalTexture = useTexture(
    textureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  );
  const isBack = side === 'back';
  
  // Decal coordinates on the oversized boxy shirt geometry
  const mappedX = (xOffset / 100) * 0.3;
  const mappedY = 0.04 + ((38 - yOffset) * 0.005);
  const mappedScale = (scaleValue / 100) * 0.32;
  const mappedRotation = (rotateValue * Math.PI) / 180;

  const decalZ = isBack ? -0.12 : 0.15;
  const decalRotY = isBack ? Math.PI : 0;
  const adjustedX = isBack ? -mappedX : mappedX;
  const adjustedRotZ = isBack ? -mappedRotation : mappedRotation;

  return (
    <Decal
      position={[adjustedX / 1.28, mappedY / 1.03, decalZ]}
      rotation={[0, decalRotY, adjustedRotZ]}
      scale={[mappedScale / 1.28, mappedScale / 1.03, mappedScale / 1.25]}
      map={decalTexture}
    />
  );
}

/* ── 3D Shirt Mesh with Multi-Decals ────────────────────────────────────── */
function Shirt({ 
  color, 
  graphics = [],
  legacyTextureUrl,
  legacyScale,
  legacyRotate,
  legacyX,
  legacyY,
  legacySide,
  typographyTexture,
  typographyOptions
}: { 
  color: string; 
  graphics?: GraphicLayer[];
  legacyTextureUrl?: string | null;
  legacyScale?: number;
  legacyRotate?: number;
  legacyX?: number;
  legacyY?: number;
  legacySide?: 'front' | 'back';
  typographyTexture?: string | null;
  typographyOptions?: {
    x: number;
    y: number;
    scale: number;
    rotate: number;
  };
}) {
  const { nodes } = useGLTF('/shirt.glb') as any;
  const shirtColor = new THREE.Color(color || '#ffffff');

  return (
    <group>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        scale={[1.28, 1.03, 1.25]} // boxy, drop-shoulder, oversized fit
        dispose={null}
      >
        <meshStandardMaterial
          color={shirtColor}
          roughness={0.82} // matte heavy combed cotton
          metalness={0.06}
          side={THREE.DoubleSide}
        />

        {/* 1. Legacy Single Texture Decal (for Admin Orders/Requested Prints) */}
        {legacyTextureUrl && (
          <Suspense fallback={null}>
            <DecalItem
              textureUrl={legacyTextureUrl}
              xOffset={legacyX ?? 0}
              yOffset={legacyY ?? 38}
              scaleValue={legacyScale ?? 45}
              rotateValue={legacyRotate ?? 0}
              side={legacySide || 'front'}
            />
          </Suspense>
        )}

        {/* 2. Front Typography Decal (Front-Only as required) */}
        {typographyTexture && typographyOptions && (
          <Suspense fallback={null}>
            <DecalItem
              textureUrl={typographyTexture}
              xOffset={typographyOptions.x}
              yOffset={typographyOptions.y}
              scaleValue={typographyOptions.scale}
              rotateValue={typographyOptions.rotate}
              side="front"
            />
          </Suspense>
        )}

        {/* 3. Multi-Graphic Decal Layers (Front AND Back simultaneous) */}
        {graphics.map((g) => (
          (g.processedUrl || g.url) ? (
            <Suspense key={g.id} fallback={null}>
              <DecalItem
                textureUrl={g.processedUrl || g.url}
                xOffset={g.x}
                yOffset={g.y}
                scaleValue={g.scale}
                rotateValue={g.rotate}
                side={g.side}
              />
            </Suspense>
          ) : null
        ))}
      </mesh>
    </group>
  );
}

/* ── Camera & Orbit Controller ─────────────────────────────────────────── */
function CameraRig({ activeView = 'front' }: { activeView?: 'front' | 'back' }) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      if (activeView === 'back') {
        controlsRef.current.setAzimuthalAngle(Math.PI);
      } else {
        controlsRef.current.setAzimuthalAngle(0);
      }
      controlsRef.current.update();
    }
  }, [activeView]);

  return (
    <OrbitControls 
      ref={controlsRef}
      enableZoom={true} 
      minDistance={1.3}
      maxDistance={3.2}
      enablePan={false}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={Math.PI / 3}
    />
  );
}

export interface CustomPrintCanvasProps {
  colorHex: string;
  // Multi-layer props
  graphics?: GraphicLayer[];
  typographyTexture?: string | null;
  typographyOptions?: {
    x: number;
    y: number;
    scale: number;
    rotate: number;
  };
  activeView?: 'front' | 'back';
  
  // Legacy backward-compatible props
  textureUrl?: string | null;
  scaleValue?: number;
  rotateValue?: number;
  xPosition?: number;
  yPosition?: number;
  printSide?: 'front' | 'back';
}

/* ── Main R3F Canvas Export ────────────────────────────────────────────── */
export default function CustomPrintCanvas({ 
  colorHex, 
  graphics = [],
  typographyTexture,
  typographyOptions,
  activeView = 'front',
  // legacy
  textureUrl,
  scaleValue,
  rotateValue,
  xPosition,
  yPosition,
  printSide
}: CustomPrintCanvasProps) {
  const effectiveView = activeView || printSide || 'front';

  return (
    <div className="w-full h-full min-h-[300px] lg:min-h-[520px] relative">
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.3], fov: 25 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.78} />
        <directionalLight position={[5, 6, 4]} intensity={1.15} castShadow />
        <directionalLight position={[-5, 6, -4]} intensity={0.75} />
        
        <Suspense fallback={null}>
          <Center>
            <Shirt 
              color={colorHex} 
              graphics={graphics}
              legacyTextureUrl={textureUrl}
              legacyScale={scaleValue}
              legacyRotate={rotateValue}
              legacyX={xPosition}
              legacyY={yPosition}
              legacySide={printSide}
              typographyTexture={typographyTexture}
              typographyOptions={typographyOptions}
            />
          </Center>
          <Environment preset="city" />
        </Suspense>

        <CameraRig activeView={effectiveView} />
      </Canvas>
    </div>
  );
}
