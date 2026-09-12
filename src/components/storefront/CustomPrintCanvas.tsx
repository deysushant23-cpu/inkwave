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
  scaleX = 100,
  scaleY = 100,
  rotateValue = 0, 
  flipX = false,
  flipY = false,
  opacity = 100,
  side = 'front' 
}: { 
  textureUrl: string; 
  xOffset?: number; 
  yOffset?: number; 
  scaleValue?: number; 
  scaleX?: number;
  scaleY?: number;
  rotateValue?: number; 
  flipX?: boolean;
  flipY?: boolean;
  opacity?: number;
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
  
  // Decal coordinates on the clean natural shirt geometry
  const mappedX = (xOffset / 100) * 0.32;
  const mappedY = 0.04 + ((38 - yOffset) * 0.0055);
  const baseScale = (scaleValue / 100) * 0.32;
  const mappedScaleX = baseScale * ((scaleX || 100) / 100) * (flipX ? -1 : 1);
  const mappedScaleY = baseScale * ((scaleY || 100) / 100) * (flipY ? -1 : 1);
  const mappedRotation = (rotateValue * Math.PI) / 180;

  let decalPosition: [number, number, number];
  let decalRotation: [number, number, number];
  let decalScale: [number, number, number];

  if (isLeftSleeve) {
    // Outer Left Sleeve (-X side)
    decalPosition = [-0.27, mappedY + 0.015, (xOffset / 100) * 0.09];
    decalRotation = [0, -Math.PI / 2, mappedRotation];
    decalScale = [mappedScaleX, mappedScaleY, 0.12];
  } else if (isRightSleeve) {
    // Outer Right Sleeve (+X side)
    decalPosition = [0.27, mappedY + 0.015, -(xOffset / 100) * 0.09];
    decalRotation = [0, Math.PI / 2, -mappedRotation];
    decalScale = [mappedScaleX, mappedScaleY, 0.12];
  } else if (isBack) {
    // Project onto Back of shirt only
    decalPosition = [-mappedX, mappedY, -0.15];
    decalRotation = [0, Math.PI, -mappedRotation];
    decalScale = [mappedScaleX, mappedScaleY, 0.12];
  } else {
    // Project onto Front Chest of shirt only
    decalPosition = [mappedX, mappedY, 0.15];
    decalRotation = [0, 0, mappedRotation];
    decalScale = [mappedScaleX, mappedScaleY, 0.12];
  }

  return (
    <Decal
      position={decalPosition}
      rotation={decalRotation}
      scale={decalScale}
      map={decalTexture}
      polygonOffsetFactor={-4}
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
  const roughness = fabricWash === 'acid-wash' ? 0.92 : fabricWash === 'mercerized' ? 0.40 : 0.76;
  const metalness = wireframe ? 0.8 : fabricWash === 'mercerized' ? 0.06 : 0.01;

  return (
    <group>
      <mesh
        geometry={nodes.T_Shirt_male.geometry}
        scale={[1, 1, 1]}
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
                scaleX={g.scaleX ?? 100}
                scaleY={g.scaleY ?? 100}
                rotateValue={g.rotate || 0}
                flipX={g.flipX ?? false}
                flipY={g.flipY ?? false}
                opacity={g.opacity ?? 100}
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
  envPreset = 'studio',
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
        camera={{ position: [0, 0, 2.35], fov: 25 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
      >
        {/* Soft balanced studio lighting - eliminates harsh dark silhouettes & shadow acne */}
        <ambientLight intensity={wireframe ? 1.4 : 1.05} />
        <directionalLight position={[3, 5, 4]} intensity={wireframe ? 1.5 : 1.15} />
        <directionalLight position={[-4, 3, 3]} intensity={0.75} />
        <directionalLight position={[0, 4, -4]} intensity={0.65} />
        <directionalLight position={[0, -3, 2]} intensity={0.35} />
        
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

          {/* Clean Soft Floating Ground Contact Shadow */}
          <ContactShadows 
            position={[0, -0.62, 0]} 
            opacity={0.42} 
            scale={2.4} 
            blur={2.0} 
            far={1.0} 
          />

          {/* Clean Studio HDRI Environment */}
          <Environment preset={envPreset as any || 'studio'} />
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
