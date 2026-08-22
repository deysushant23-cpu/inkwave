'use client';

import { useEffect, useRef } from 'react';

export default function ProductViewer3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let isMounted = true;
    let animationFrameId: number;
    let isDragging = false;
    let previousMouseX = 0;

    // We only load Three.js if it hasn't been loaded
    const initThreeJS = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const THREE = (window as any).THREE;
      if (!THREE || !isMounted) return;

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0x00E5FF, 1.5);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      const purpleLight = new THREE.PointLight(0x9D00FF, 1);
      purpleLight.position.set(-5, -5, 5);
      scene.add(purpleLight);

      // Simple Hoodie Silhouette using Primitives
      const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.8, 3, 32);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 80 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      
      const sleeveGeometry = new THREE.CylinderGeometry(0.5, 0.4, 3.5, 32);
      const leftSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
      leftSleeve.position.set(-1.8, 0.5, 0);
      leftSleeve.rotation.z = Math.PI / 4;
      
      const rightSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
      rightSleeve.position.set(1.8, 0.5, 0);
      rightSleeve.rotation.z = -Math.PI / 4;

      const hoodGeometry = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
      hood.position.y = 1.5;

      const garment = new THREE.Group();
      garment.add(body, leftSleeve, rightSleeve, hood);
      scene.add(garment);

      camera.position.z = 8;

      const handleMouseDown = () => isDragging = true;
      const handleMouseUp = () => isDragging = false;
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          const deltaX = e.clientX - previousMouseX;
          garment.rotation.y += deltaX * 0.01;
        }
        previousMouseX = e.clientX;
      };

      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);

      const animate = () => {
        if (!isMounted) return;
        animationFrameId = requestAnimationFrame(animate);
        if (!isDragging) {
          garment.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
      };

      const handleResize = () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);
      animate();

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        container.removeChild(renderer.domElement);
      };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).THREE) {
      const script = document.createElement('script');
      script.src = 'https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js';
      script.onload = initThreeJS;
      document.head.appendChild(script);
    } else {
      initThreeJS();
    }

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing"></div>
  );
}
