import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { KODAIKANAL_LANDMARKS, KodaikanalLandmark } from '../../data/resort';

interface KodaikanalMap3DProps {
  selectedLandmark: KodaikanalLandmark;
  onSelectLandmark: (landmark: KodaikanalLandmark) => void;
}

export const KodaikanalMap3D: React.FC<KodaikanalMap3DProps> = ({
  selectedLandmark,
  onSelectLandmark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const selectedRef = useRef<KodaikanalLandmark>(selectedLandmark);

  useEffect(() => {
    selectedRef.current = selectedLandmark;
  }, [selectedLandmark]);

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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#071916', 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      120
    );
    camera.position.set(0, 5.5, 11);

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x071916, 1);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight('#526B52', 2.0);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight('#C5D1D0', '#071916', 1.2);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight('#D4B47A', 3.0);
    sun.position.set(12, 18, 10);
    scene.add(sun);

    // Topographic Terrain Mesh
    const terrainGeo = new THREE.PlaneGeometry(22, 16, 56, 42);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const elevation =
        Math.sin(x * 0.35) * Math.cos(z * 0.35) * 1.3 +
        Math.cos(x * 0.7 - z * 0.5) * 0.45 +
        0.8;
      pos.setY(i, Math.max(0.1, elevation));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: '#092B25',
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrain);

    // Contour Wireframe Overlay
    const contourMat = new THREE.MeshBasicMaterial({
      color: '#526B52',
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const contourMesh = new THREE.Mesh(terrainGeo, contourMat);
    contourMesh.position.y = 0.02;
    scene.add(contourMesh);

    // Winding Highland Road Ribbon connecting landmarks
    const roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.2, 0.7, -2.5), // Kodaikanal Lake
      new THREE.Vector3(0, 1.5, 0), // The Meadows Resort
      new THREE.Vector3(2.6, 1.2, 3.2), // Chettiar Park
      new THREE.Vector3(4.8, 1.9, -3.8), // Berijam Lake
    ]);
    const roadGeo = new THREE.TubeGeometry(roadCurve, 64, 0.06, 8, false);
    const roadMat = new THREE.MeshBasicMaterial({ color: '#D4B47A', transparent: true, opacity: 0.65 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    scene.add(roadMesh);

    // Interactive 3D Landmark Beacons
    const markerMeshes: THREE.Mesh[] = [];
    const pinGeo = new THREE.ConeGeometry(0.24, 0.7, 16);
    pinGeo.rotateX(Math.PI);

    KODAIKANAL_LANDMARKS.forEach((lm) => {
      const isResort = lm.id === 'lm-meadows-resort';
      const mat = new THREE.MeshStandardMaterial({
        color: isResort ? '#D4B47A' : '#C66D3D',
        emissive: isResort ? '#D4B47A' : '#C66D3D',
        emissiveIntensity: 0.5,
      });
      const pin = new THREE.Mesh(pinGeo, mat);
      pin.position.set(lm.coordinates[0], lm.coordinates[1] + 0.5, lm.coordinates[2]);
      pin.userData = { landmark: lm };
      scene.add(pin);
      markerMeshes.push(pin);
    });

    // Raycaster for clicking 3D pins directly
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markerMeshes, false);
      if (hits.length > 0) {
        const lm = hits[0].object.userData.landmark as KodaikanalLandmark;
        if (lm) onSelectLandmark(lm);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

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

    const currentLookAt = new THREE.Vector3(0, 1.2, 0);
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (!isTabVisible || !isIntersecting) return;

      try {
        const t = clock.getElapsedTime();
        const targetLm = selectedRef.current;

        // Smoothly interpolate camera position and target toward selected landmark
        const desiredCamPos = new THREE.Vector3(...targetLm.cameraOffset);
        const desiredTarget = new THREE.Vector3(...targetLm.cameraTarget);

        camera.position.lerp(desiredCamPos, 0.045);
        currentLookAt.lerp(desiredTarget, 0.06);
        camera.lookAt(currentLookAt);

        markerMeshes.forEach((pin, idx) => {
          const lm = pin.userData.landmark as KodaikanalLandmark;
          const isSelected = lm.id === targetLm.id;
          pin.position.y =
            lm.coordinates[1] + 0.55 + Math.sin(t * 3 + idx) * (isSelected ? 0.16 : 0.06);
          pin.scale.setScalar(isSelected ? 1.35 : 0.95);
          pin.rotation.y = t * 1.2;
        });

        renderer.render(scene, camera);
      } catch (err) {
        console.warn('KodaikanalMap3D render exception caught safely:', err);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
      terrainGeo.dispose();
      terrainMat.dispose();
      contourMat.dispose();
      roadGeo.dispose();
      roadMat.dispose();
      pinGeo.dispose();
      renderer.dispose();
    };
  }, [isVisible, onSelectLandmark]);

  if (!supported) {
    return (
      <div className="w-full h-80 rounded-xl bg-[#071916] border border-[#D4B47A]/20 flex items-center justify-center p-6">
        <p className="font-serif-display text-2xl text-[#F2E9D8]">{selectedLandmark.name}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] md:h-[460px] rounded-xl overflow-hidden bg-[#050708] border border-[#D4B47A]/25">
      <div ref={containerRef} className="w-full h-full cursor-pointer" data-cursor="EXPLORE" />
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between pointer-events-none text-xs">
        <span className="text-[#D4B47A] uppercase tracking-[0.2em]">
          Interactive 3D Topographic Map · Kodaikanal
        </span>
        <span className="text-[#C5D1D0]">Click markers or cards to fly camera</span>
      </div>
    </div>
  );
};
