import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RESORT_ASSETS } from '../../data/resort';
import {
  detectInitialQualityTier,
  getQualityConfig,
  FpsMonitor,
  QualityTier,
} from '../../lib/3d/adaptiveQuality';

interface MountainHero3DProps {
  scrollProgress?: number;
}

export const MountainHero3D: React.FC<MountainHero3DProps> = ({ scrollProgress = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const scrollRef = useRef<number>(scrollProgress);
  const qualityRef = useRef<QualityTier>(detectInitialQualityTier());

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Fast safe WebGL detection
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const initialTier = qualityRef.current;
    const config = getQualityConfig(initialTier);

    // 1. Scene
    const scene = new THREE.Scene();
    const fog = new THREE.FogExp2('#071916', 0.012);
    scene.fog = fog;

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(46, width / Math.max(height, 1), 0.1, 250);
    camera.position.set(0, 6.5, 24);

    // 3. Renderer with adaptive pixel ratio and transparent background
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: config.tier === 'HIGH' || config.tier === 'MEDIUM',
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(config.pixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglSupported(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight('#526B52', 1.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#C5D1D0', '#071916', 1.4);
    hemiLight.position.set(0, 45, 10);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#D4B47A', 3.2);
    sunLight.position.set(22, 28, 18);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight('#526F7A', 2.0);
    rimLight.position.set(-25, 18, 12);
    scene.add(rimLight);

    const resortBeacon = new THREE.PointLight('#C66D3D', 4.5, 28, 1.2);
    resortBeacon.position.set(0, 2.5, -4);
    scene.add(resortBeacon);

    // 5. Procedural Mountain Ridges
    const createMountainRidge = (
      geoWidth: number,
      geoDepth: number,
      segX: number,
      segZ: number,
      zOffset: number,
      heightScale: number,
      colorHex: string,
      roughnessVal: number
    ) => {
      const geo = new THREE.PlaneGeometry(geoWidth, geoDepth, segX, segZ);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const ridge1 = Math.sin(x * 0.07 + zOffset * 0.04) * Math.cos(z * 0.08) * heightScale;
        const ridge2 = Math.sin(x * 0.18 - z * 0.12) * (heightScale * 0.45);
        const detail = Math.cos(x * 0.42 + z * 0.3) * (heightScale * 0.15);
        const valleyMask = Math.min(1, Math.pow(Math.abs(x) / 16, 1.35) + 0.12);
        const y = Math.max(0, (ridge1 + ridge2 + detail + heightScale * 0.5) * valleyMask);
        pos.setY(i, y);
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: roughnessVal,
        metalness: 0.12,
        flatShading: true,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = zOffset;
      scene.add(mesh);
      return { mesh, geo, mat };
    };

    const [sX, sZ] = config.mountainSegments;
    const farMountains = createMountainRidge(160, 50, sX, sZ, -55, 14, '#123C32', 0.85);
    const midMountains = createMountainRidge(125, 45, Math.round(sX * 0.9), Math.round(sZ * 0.9), -26, 9.0, '#092B25', 0.82);
    const foreTerrain = createMountainRidge(95, 38, Math.round(sX * 0.8), Math.round(sZ * 0.8), 2, 4.5, '#071916', 0.9);

    // 6. Pavilion Silhouette
    const resortGroup = new THREE.Group();
    resortGroup.position.set(0, 1.2, -6);

    const lodgeBodyGeo = new THREE.BoxGeometry(4.8, 1.5, 2.6);
    const lodgeBodyMat = new THREE.MeshStandardMaterial({
      color: '#123C32',
      roughness: 0.6,
      metalness: 0.25,
    });
    const lodgeBody = new THREE.Mesh(lodgeBodyGeo, lodgeBodyMat);
    resortGroup.add(lodgeBody);

    const roofGeo = new THREE.ConeGeometry(3.8, 1.3, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: '#050708',
      roughness: 0.7,
      metalness: 0.2,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.35;
    resortGroup.add(roof);

    const windowGeo = new THREE.PlaneGeometry(3.6, 0.65);
    const windowMat = new THREE.MeshBasicMaterial({ color: '#D4B47A' });
    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
    windowMesh.position.set(0, 0.05, 1.31);
    resortGroup.add(windowMesh);

    scene.add(resortGroup);

    // 7. Instanced Trees (Count adapted to device quality tier)
    const treeCount = config.treeCount;
    const trunkGeo = new THREE.ConeGeometry(0.45, 2.8, 5);
    trunkGeo.translate(0, 1.4, 0);
    const treeMat = new THREE.MeshStandardMaterial({
      color: '#123C32',
      roughness: 0.85,
      flatShading: true,
    });
    const instancedTrees = new THREE.InstancedMesh(trunkGeo, treeMat, treeCount);

    const dummy = new THREE.Object3D();
    const treeInitialData: { x: number; y: number; z: number; scale: number; phase: number }[] = [];

    for (let i = 0; i < treeCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (3.8 + Math.random() * 32);
      const z = -45 + Math.random() * 65;
      const valleyFactor = Math.min(1, Math.pow(Math.abs(x) / 16, 1.35) + 0.12);
      const approxY = Math.max(0.2, valleyFactor * (2.6 + Math.sin(x * 0.1) * 1.5));
      const scale = 0.55 + Math.random() * 1.1;

      dummy.position.set(x, approxY - 0.2, z);
      dummy.scale.set(scale, scale * (0.9 + Math.random() * 0.35), scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();
      instancedTrees.setMatrixAt(i, dummy.matrix);

      treeInitialData.push({
        x,
        y: approxY - 0.2,
        z,
        scale,
        phase: Math.random() * Math.PI * 2,
      });
    }
    scene.add(instancedTrees);

    // 8. Adaptive Dust Particles
    const particleCount = config.particleCount;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = 0.5 + Math.random() * 18;
      positions[i * 3 + 2] = -42 + Math.random() * 65;
      speeds[i] = 0.006 + Math.random() * 0.016;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#D4B47A',
      size: initialTier === 'MOBILE' ? 0.2 : 0.16,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Floating Silver Mist Ribbons
    const mistGroup = new THREE.Group();
    const mistGeo = new THREE.PlaneGeometry(32, 10);
    const mistMat = new THREE.MeshBasicMaterial({
      color: '#C5D1D0',
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mistPlanesCount = config.tier === 'LOW' || config.tier === 'MOBILE' ? 3 : 5;
    for (let i = 0; i < mistPlanesCount; i++) {
      const mPlane = new THREE.Mesh(mistGeo, mistMat);
      mPlane.rotation.x = -Math.PI / 2.3;
      mPlane.position.set(
        (i % 2 === 0 ? -1 : 1) * (5 + i * 2),
        2.2 + i * 0.5,
        -28 + i * 9
      );
      mistGroup.add(mPlane);
    }
    scene.add(mistGroup);

    // 10. Mouse Parallax & Dynamic Quality Management
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (initialTier === 'MOBILE') return;
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Dynamic FPS Monitor to step down quality tier if rendering lags
    const fpsMonitor = new FpsMonitor(initialTier, (newTier) => {
      qualityRef.current = newTier;
      const newConfig = getQualityConfig(newTier);
      renderer.setPixelRatio(newConfig.pixelRatio);
    });

    // Page Visibility API: Pause render loop when browser tab is inactive to preserve battery & CPU
    let isTabVisible = document.visibilityState === 'visible';
    const onVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 11. Animation Loop with Protection & Visibility Check
    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Skip render if page is backgrounded or hidden
      if (!isTabVisible) return;

      try {
        fpsMonitor.tick();
        const elapsed = clock.getElapsedTime();

        const parallaxStrength = initialTier === 'MOBILE' ? 0.25 : 1.4;
        currentMouseX += (targetMouseX * parallaxStrength - currentMouseX) * 0.04;
        currentMouseY += (targetMouseY * (parallaxStrength * 0.4) - currentMouseY) * 0.04;

        const scrollRatio = Math.min(1, Math.max(0, scrollRef.current));
        const targetZ = 24 - scrollRatio * 16;
        const targetY = 6.5 - scrollRatio * 1.8 + currentMouseY * 0.5;

        camera.position.x += (currentMouseX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.position.z += (targetZ - camera.position.z) * 0.05;

        // Drift particles upward
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          let py = posAttr.getY(i) + speeds[i];
          let px = posAttr.getX(i) + Math.sin(elapsed * 0.4 + i) * 0.006;
          if (py > 18) py = 0.6;
          posAttr.setY(i, py);
          posAttr.setX(i, px);
        }
        posAttr.needsUpdate = true;

        // Mist ribbon drift
        mistGroup.children.forEach((plane, idx) => {
          plane.position.x += Math.sin(elapsed * 0.2 + idx) * 0.009;
        });

        // Tree sway in mountain breeze
        const swayLimit = Math.min(treeCount, 50);
        for (let i = 0; i < swayLimit; i++) {
          const td = treeInitialData[i];
          dummy.position.set(td.x, td.y, td.z);
          dummy.scale.set(td.scale, td.scale, td.scale);
          dummy.rotation.z = Math.sin(elapsed * 1.1 + td.phase) * 0.02;
          dummy.updateMatrix();
          instancedTrees.setMatrixAt(i, dummy.matrix);
        }
        instancedTrees.instanceMatrix.needsUpdate = true;

        camera.lookAt(currentMouseX * 0.25, 2.4, -12);
        renderer.render(scene, camera);
      } catch (err) {
        console.warn('Three.js render exception handled gracefully:', err);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);

      // Clean disposal of geometries, materials, buffers
      farMountains.geo.dispose();
      farMountains.mat.dispose();
      midMountains.geo.dispose();
      midMountains.mat.dispose();
      foreTerrain.geo.dispose();
      foreTerrain.mat.dispose();
      lodgeBodyGeo.dispose();
      lodgeBodyMat.dispose();
      roofGeo.dispose();
      roofMat.dispose();
      windowGeo.dispose();
      windowMat.dispose();
      trunkGeo.dispose();
      treeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      mistGeo.dispose();
      mistMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#071916]">
      {/* Foundation Layer: Crisp photographic landscape of The Meadows Resort Kodaikanal */}
      <img
        src={RESORT_ASSETS.hero}
        alt="The Meadows Resort Kodaikanal misty mountain backdrop"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-85 scale-100 select-none brightness-105"
      />

      {/* Atmospheric gradient overlay for optimal editorial text contrast without obscuring mountain view */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050708] via-transparent to-[#050708]/60" />
      <div className="absolute inset-0 pointer-events-none bg-radial-[at_center_center] from-transparent via-[#050708]/15 to-[#050708]/50" />

      {/* Live Three.js WebGL Layer (Transparent Canvas for floating mist and gold ember dust) */}
      {webglSupported && (
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-1"
          aria-label="Interactive 3D Kodaikanal mountain landscape"
        />
      )}
    </div>
  );
};
