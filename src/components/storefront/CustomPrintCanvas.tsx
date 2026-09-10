'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, Decal, useTexture, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { GraphicLayer, FabricWashStyle } from '@/lib/customPrintHelpers';

// Pre-load the GLB model locally
useGLTF.preload('/shirt.glb');

/* ── Individual Decal Layer Component with Slap-On & Sleeve Projection ─── */
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
  side?: 'front' | 'back' | 'sleeve-left' | 'sleeve-right'; 
}) {
  const decalTexture = useTexture(
    textureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  );

  useEffect(() => {
    if (decalTexture) {
      decalTexture.generateMipmaps = true;
      decalTexture.minFilter = THREE.LinearMipmapLinearFilter;
      decalTexture.magFilter = THREE.LinearFilter;
      decalTexture.anisotropy = 16;
      decalTexture.needsUpdate = true;
    }
  }, [decalTexture]);

  const isBack = side === 'back';
  const isLeftSleeve = side === 'sleeve-left';
  const isRightSleeve = side === 'sleeve-right';
  
  // Decal coordinates on the oversized boxy shirt geometry
  const mappedX = (xOffset / 100) * 0.32;
  const mappedY = 0.04 + ((38 - yOffset) * 0.0055);
  const mappedScale = (scaleValue / 100) * 0.34;
  const mappedRotation = (rotateValue * Math.PI) / 180;

  let decalPosition: [number, number, number];
  let decalRotation: [number, number, number];
  let decalScale: [number, number, number];

  if (isLeftSleeve) {
    // Outer Left Sleeve:
    // Outer surface of the left arm sleeve mesh (-X side)
    decalPosition = [-0.265 / 1.28, (mappedY + 0.015) / 1.03, (xOffset / 100) * 0.07];
    decalRotation = [0, -Math.PI / 2, mappedRotation];
    // Controlled projection depth (0.12) ensures clean wrap around outer bicep without bleeding into torso
    decalScale = [mappedScale / 1.25, mappedScale / 1.03, 0.12];
  } else if (isRightSleeve) {
    // Outer Right Sleeve:
    // Outer surface of the right arm sleeve mesh (+X side)
    decalPosition = [0.265 / 1.28, (mappedY + 0.015) / 1.03, -(xOffset / 100) * 0.07];
    decalRotation = [0, Math.PI / 2, -mappedRotation];
    decalScale = [mappedScale / 1.25, mappedScale / 1.03, 0.12];
  } else if (isBack) {
    // Project onto Back of shirt
    const projectionDepth = Math.max(0.38, (mappedScale / 1.25) * 2.5);
    decalPosition = [-mappedX / 1.28, mappedY / 1.03, -0.16];
    decalRotation = [0, Math.PI, -mappedRotation];
    decalScale = [mappedScale / 1.28, mappedScale / 1.03, projectionDepth];
  } else {
    // Project onto Front Chest of shirt
    const projectionDepth = Math.max(0.38, (mappedScale / 1.25) * 2.5);
    decalPosition = [mappedX / 1.28, mappedY / 1.03, 0.16];
    decalRotation = [0, 0, mappedRotation];
    decalScale = [mappedScale / 1.28, mappedScale / 1.03, projectionDepth];
  }

  return (
    <Decal
      position={decalPosition}
      rotation={decalRotation}
      scale={decalScale}
      map={decalTexture}
      polygonOffsetFactor={-2}
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
  legacySide?: 'front' | 'back' | 'sleeve-left' | 'sleeve-right';
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

        {/* 2. Front Typography Decal */}
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

        {/* 3. Multi-Graphic Decal Layers (Front, Back, L-Sleeve, R-Sleeve simultaneous) */}
        {!wireframe && graphics.map((g, idx) => (
          (g.processedUrl || g.url) ? (
            <Suspense key={g.id || `graphic-${idx}`} fallback={null}>
              <DecalItem
                textureUrl={g.processedUrl || g.url}
                xOffset={g.x}
                yOffset={g.y}
                scaleValue={g.scale}
                rotateValue={g.rotate || 0}
                side={g.side || 'front'}
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
  autoRotateSpeed = 2.0,
  enableOrbit = false
}: { 
  activeView?: string; 
  autoRotate?: boolean; 
  autoRotateSpeed?: number; 
  enableOrbit?: boolean; 
}) {
  const controlsRef = useRef<any>(null);

  // Smoothly update camera azimuthal rotation angle on preset change
  useEffect(() => {
    if (controlsRef.current) {
      if (activeView === 'back') {
        controlsRef.current.setAzimuthalAngle(Math.PI);
      } else if (activeView === 'sleeve-left' || activeView === 'side-left') {
        controlsRef.current.setAzimuthalAngle(-Math.PI / 2);
      } else if (activeView === 'sleeve-right' || activeView === 'side-right') {
        controlsRef.current.setAzimuthalAngle(Math.PI / 2);
      } else if (activeView === 'angle-left' || activeView === '3quarter') {
        controlsRef.current.setAzimuthalAngle(-Math.PI / 4);
      } else if (activeView === 'angle-right') {
        controlsRef.current.setAzimuthalAngle(Math.PI / 4);
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
      enableRotate={enableOrbit}
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
  enableOrbit?: boolean;
  onDragDecal?: (deltaX: number, deltaY: number) => void;
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
  activeView?: 'front' | 'back' | 'sleeve-left' | 'sleeve-right' | 'angle-left' | 'angle-right' | 'side-left' | 'side-right' | string;
  
  // Legacy backward-compatible props
  textureUrl?: string | null;
  scaleValue?: number;
  rotateValue?: number;
  xPosition?: number;
  yPosition?: number;
  printSide?: 'front' | 'back' | 'sleeve-left' | 'sleeve-right';
}

/* ── Main R3F Canvas Export ────────────────────────────────────────────── */
export default function CustomPrintCanvas({ 
  colorHex, 
  color,
  wireframe = false,
  fabricWash = 'solid',
  autoRotate = false,
  autoRotateSpeed = 2.0,
  enableOrbit = false,
  onDragDecal,
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

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!enableOrbit && onDragDecal) {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current && onDragDecal) {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      onDragDecal(dx, dy);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  return (
    <div 
      className={`w-full h-full min-h-[360px] lg:min-h-[580px] relative select-none ${enableOrbit ? 'cursor-grab active:cursor-grabbing' : 'cursor-move'}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
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
            scale={2.2} 
            blur={1.8} 
            far={1.2} 
          />

          {/* HDR Environment Lighting Simulation */}
          <Environment preset={envPreset as any} />
        </Suspense>

        <CameraRig 
          activeView={effectiveView} 
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableOrbit={enableOrbit}
        />
      </Canvas>
    </div>
  );
}
