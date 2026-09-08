'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, Decal, useTexture, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { GraphicLayer, FabricWashStyle } from '@/lib/customPrintHelpers';

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

/* ── 3D Shirt Mesh with Multi-Decals & Wireframe Mode ──────────────────── */
function Shirt({ 
  color, 
  wireframe = false,
  fabricWash = 'solid',
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
  wireframe?: boolean;
  fabricWash?: FabricWashStyle;
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
  const roughness = fabricWash === 'acid-wash' ? 0.96 : fabricWash === 'mercerized' ? 0.45 : 0.82;
  const metalness = wireframe ? 0.8 : fabricWash === 'mercerized' ? 0.12 : 0.05;

  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.T_Shirt_male.geometry}
        scale={[1.28, 1.03, 1.25]} // boxy, drop-shoulder, oversized fit
        dispose={null}
      >
        <meshStandardMaterial
          color={wireframe ? '#c084fc' : shirtColor}
          wireframe={wireframe}
          roughness={roughness}
          metalness={metalness}
          side={THREE.DoubleSide}
        />

        {/* 1. Legacy Single Texture Decal (for Admin Orders/Requested Prints) */}
        {!wireframe && legacyTextureUrl && (
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
        {!wireframe && typographyTexture && typographyOptions && (
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
        {!wireframe && graphics.map((g) => (
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
function CameraRig({ 
  activeView = 'front', 
  autoRotate = false,
  autoRotateSpeed = 2.0
}: { 
  activeView?: 'front' | 'back' | 'angle-left' | 'angle-right' | 'side-left' | 'side-right' | string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      if (activeView === 'back') {
        controlsRef.current.setAzimuthalAngle(Math.PI);
      } else if (activeView === 'angle-left') {
        controlsRef.current.setAzimuthalAngle(-Math.PI / 4);
      } else if (activeView === 'angle-right') {
        controlsRef.current.setAzimuthalAngle(Math.PI / 4);
      } else if (activeView === 'side-left') {
        controlsRef.current.setAzimuthalAngle(-Math.PI / 2);
      } else if (activeView === 'side-right') {
        controlsRef.current.setAzimuthalAngle(Math.PI / 2);
      } else {
        controlsRef.current.setAzimuthalAngle(0);
      }
      controlsRef.current.update();
    }
  }, [activeView]);

  return (
    <OrbitControls 
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      enableZoom={true} 
      minDistance={1.2}
      maxDistance={3.5}
      enablePan={false}
      maxPolarAngle={Math.PI / 1.8}
      minPolarAngle={Math.PI / 3.2}
      dampingFactor={0.08}
      enableDamping
    />
  );
}

export interface CustomPrintCanvasProps {
  colorHex?: string;
  color?: string;
  wireframe?: boolean;
  fabricWash?: FabricWashStyle;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  envPreset?: 'city' | 'studio' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'lobby' | 'park';
  // Multi-layer props
  graphics?: GraphicLayer[];
  typographyTexture?: string | null;
  typographyOptions?: {
    x: number;
    y: number;
    scale: number;
    rotate: number;
  };
  activeView?: 'front' | 'back' | 'angle-left' | 'angle-right' | 'side-left' | 'side-right' | string;
  
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
  color,
  wireframe = false,
  fabricWash = 'solid',
  autoRotate = false,
  autoRotateSpeed = 2.0,
  envPreset = 'city',
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
  const finalColor = color || colorHex || '#ffffff';
  const effectiveView = activeView || printSide || 'front';

  return (
    <div className="w-full h-full min-h-[360px] lg:min-h-[580px] relative">
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.4], fov: 25 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
      >
        <ambientLight intensity={wireframe ? 1.4 : 0.85} />
        <directionalLight position={[5, 6, 4]} intensity={wireframe ? 1.5 : 1.25} castShadow />
        <directionalLight position={[-5, 6, -4]} intensity={0.75} />
        <directionalLight position={[0, -5, 2]} intensity={0.35} />
        
        <Suspense fallback={null}>
          <Center>
            <Shirt 
              color={finalColor} 
              wireframe={wireframe}
              fabricWash={fabricWash}
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

          {/* Soft Ground Contact Shadow */}
          <ContactShadows 
            position={[0, -0.65, 0]} 
            opacity={0.65} 
            scale={2.8} 
            blur={2.4} 
            far={1.8} 
          />

          <Environment preset={envPreset as any} />
        </Suspense>

        <CameraRig 
          activeView={effectiveView} 
          autoRotate={autoRotate} 
          autoRotateSpeed={autoRotateSpeed} 
        />
      </Canvas>
    </div>
  );
}

