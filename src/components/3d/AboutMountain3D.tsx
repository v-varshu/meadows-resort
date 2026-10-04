import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const AboutMountain3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#071916', 0.045);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 2.2, 8.5);

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight('#123C32', 1.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight('#D4B47A', 2.8);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#81957A', 1.8);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Sculpted 3D Mountain Monolith Object
    const mountainGroup = new THREE.Group();
    const peakGeo = new THREE.ConeGeometry(2.6, 3.6, 7, 4);
    const pos = peakGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const noise = Math.sin(vx * 2.1 + vy * 1.4) * 0.22 + Math.cos(vz * 2.5) * 0.18;
      pos.setXYZ(i, vx + noise, vy, vz + noise);
    }
    peakGeo.computeVertexNormals();

    const peakMat = new THREE.MeshStandardMaterial({
      color: '#092B25',
      roughness: 0.72,
      metalness: 0.18,
      flatShading: true,
    });
    const mainPeak = new THREE.Mesh(peakGeo, peakMat);
    mountainGroup.add(mainPeak);

    const wireMat = new THREE.MeshBasicMaterial({
      color: '#D4B47A',
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const wirePeak = new THREE.Mesh(peakGeo, wireMat);
    wirePeak.scale.setScalar(1.015);
    mountainGroup.add(wirePeak);

    // Floating Botanical Leaves around the mountain
    const leafCount = prefersReducedMotion ? 12 : 24;
    const leafGeo = new THREE.OctahedronGeometry(0.11, 0);
    leafGeo.scale(1, 0.25, 1.8);
    const leafMat = new THREE.MeshStandardMaterial({
      color: '#81957A',
      roughness: 0.5,
      metalness: 0.2,
    });
    const leavesMesh = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
    const dummy = new THREE.Object3D();
    const leafOrbits = Array.from({ length: leafCount }, (_, i) => ({
      radius: 2.3 + Math.random() * 1.8,
      angle: (i / leafCount) * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.35,
      yOffset: (Math.random() - 0.5) * 2.8,
      rotSpeed: 0.5 + Math.random() * 1.2,
    }));

    scene.add(leavesMesh);
    scene.add(mountainGroup);

    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Page visibility & Intersection Observer: pause rendering when offscreen
    let isIntersecting = true;
    let isTabVisible = document.visibilityState === 'visible';

    const observer = new IntersectionObserver(
      (entries) => {
        isIntersecting = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: '100px' }
    );
    observer.observe(container);

    const onVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Only perform computations if visible to save GPU and battery
      if (!isTabVisible || !isIntersecting) return;

      try {
        const t = clock.getElapsedTime();

        if (!prefersReducedMotion) {
          mountainGroup.rotation.y = t * 0.18 + mouseX * 0.35;
          mountainGroup.rotation.x = mouseY * 0.15;
          mountainGroup.position.y = Math.sin(t * 0.8) * 0.12;

          leafOrbits.forEach((orb, idx) => {
            const curAngle = orb.angle + t * orb.speed;
            dummy.position.set(
              Math.cos(curAngle) * orb.radius,
              orb.yOffset + Math.sin(t * 1.2 + idx) * 0.25,
              Math.sin(curAngle) * orb.radius
            );
            dummy.rotation.set(t * orb.rotSpeed, curAngle, Math.sin(t + idx) * 0.5);
            dummy.updateMatrix();
            leavesMesh.setMatrixAt(idx, dummy.matrix);
          });
          leavesMesh.instanceMatrix.needsUpdate = true;
        }

        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      } catch (err) {
        console.warn('AboutMountain3D render caught safely:', err);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();

      peakGeo.dispose();
      peakMat.dispose();
      wireMat.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      renderer.dispose();
    };
  }, [isVisible]);

  if (!supported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#071916]/60 border border-[#D4B47A]/20 rounded-xl p-8">
        <div className="text-center">
          <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase mb-2">Kodaikanal Elevation</div>
          <p className="font-serif-display text-2xl text-[#F2E9D8]">Palani Hills Sanctuary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] md:h-[460px] rounded-xl overflow-hidden bg-gradient-to-b from-[#071916]/90 to-[#050708] border border-[#D4B47A]/20">
      <div ref={containerRef} className="w-full h-full" data-cursor="DISCOVER" />
      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between pointer-events-none text-xs text-[#C5D1D0]/80">
        <span>3D Topographic Sanctuary Study</span>
        <span className="font-mono-tabular text-[#D4B47A]">10.2381° N · 77.4892° E</span>
      </div>
    </div>
  );
};
