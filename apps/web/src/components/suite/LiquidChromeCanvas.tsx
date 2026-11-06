'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LiquidChromeCanvasProps {
  width?: number;
  height?: number;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function webglAvailable(): boolean {
  try {
    const probe = document.createElement('canvas');
    return !!(probe.getContext('webgl2') ?? probe.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Decorative WebGL sculpture. Honors prefers-reduced-motion (renders one static
 * frame, no pointer tilt), pauses while the tab is hidden, and falls back to a
 * CSS gradient when WebGL is unavailable.
 */
export function LiquidChromeCanvas({ width = 160, height = 150 }: LiquidChromeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    if (!webglAvailable()) {
      setFallback(true);
      return;
    }

    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    let reduceMotion = motionQuery.matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(0.95, 0.34, 120, 24, 2, 3);
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
    mesh.rotation.set(0.35, 0.6, 0);
    scene.add(mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight1 = new THREE.DirectionalLight(0xffa69e, 3.5);
    dirLight1.position.set(3, 4, 3);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xe11d48, 2.5);
    dirLight2.position.set(-3, -2, -2);
    scene.add(dirLight2);
    const pointLight = new THREE.PointLight(0xffffff, 2.0, 10);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    let targetRotationX = 0;
    let targetRotationY = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (reduceMotion) return;
      const rect = container.getBoundingClientRect();
      targetRotationY = ((e.clientX - rect.left) / width - 0.5) * 2.4;
      targetRotationX = ((e.clientY - rect.top) / height - 0.5) * 2.4;
    };
    container.addEventListener('mousemove', onMouseMove);

    let frameId = 0;
    const clock = new THREE.Clock();
    const renderStatic = () => renderer.render(scene, camera);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      mesh.rotation.x += (targetRotationX + Math.sin(t * 0.8) * 0.2 - mesh.rotation.x) * 0.05;
      mesh.rotation.y += (targetRotationY + t * 0.45 - mesh.rotation.y) * 0.05;
      mesh.rotation.z = Math.sin(t * 0.6) * 0.15;
      const scale = 1.0 + Math.sin(t * 1.5) * 0.025;
      mesh.scale.set(scale, scale, scale);
      renderer.render(scene, camera);
    };

    const start = () => {
      cancelAnimationFrame(frameId);
      if (reduceMotion || document.visibilityState === 'hidden') {
        renderStatic();
      } else {
        animate();
      }
    };

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
      start();
    };
    const onVisibility = () => start();
    motionQuery.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      cancelAnimationFrame(frameId);
      motionQuery.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibility);
      container.removeEventListener('mousemove', onMouseMove);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [width, height]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 14px 28px rgba(225, 29, 72, 0.28))',
      }}
    >
      {fallback && (
        <span
          style={{
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #FFA69E 0%, #E11D48 55%, #881337 100%)',
          }}
        />
      )}
    </div>
  );
}
