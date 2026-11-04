'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LiquidChromeCanvasProps {
  width?: number;
  height?: number;
  isDark?: boolean;
}

export function LiquidChromeCanvas({ width = 160, height = 150, isDark = false }: LiquidChromeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3D Organic Liquid Geometry (Torus Knot with organic deformation)
    const geometry = new THREE.TorusKnotGeometry(0.95, 0.34, 120, 24, 2, 3);

    // Liquid Metallic Chrome Material with Rose-Gold / Crimson iridescence
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FF4D6D'),
      emissive: new THREE.Color('#881337'),
      emissiveIntensity: 0.18,
      roughness: 0.12,
      metalness: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffa69e, 3.5);
    dirLight1.position.set(3, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe11d48, 2.5);
    dirLight2.position.set(-3, -2, -2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 2.0, 10);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    // Mouse Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
      targetRotationY = mouseX * 1.2;
      targetRotationX = mouseY * 1.2;
    };

    container.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Organic continuous floating motion
      mesh.rotation.x += (targetRotationX + Math.sin(elapsedTime * 0.8) * 0.2 - mesh.rotation.x) * 0.05;
      mesh.rotation.y += (targetRotationY + elapsedTime * 0.45 - mesh.rotation.y) * 0.05;
      mesh.rotation.z = Math.sin(elapsedTime * 0.6) * 0.15;

      // Pulsing scale breathing
      const scale = 1.0 + Math.sin(elapsedTime * 1.5) * 0.025;
      mesh.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [width, height]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        filter: 'drop-shadow(0 14px 28px rgba(225, 29, 72, 0.28))',
      }}
    />
  );
}
