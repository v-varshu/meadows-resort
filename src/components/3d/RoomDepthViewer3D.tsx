import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Compass, X } from 'lucide-react';
import { RoomData, RoomHotspot } from '../../data/resort';

interface RoomDepthViewer3DProps {
  room: RoomData;
  onClose: () => void;
  onBookRoom: (roomName: string) => void;
}

export const RoomDepthViewer3D: React.FC<RoomDepthViewer3DProps> = ({
  room,
  onClose,
  onBookRoom,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<RoomHotspot>(room.hotspots[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightingMode, setLightingMode] = useState<'MORNING' | 'TWILIGHT'>('MORNING');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const cameraTargetRef = useRef({ yaw: 0, pitch: 0, zoom: 1 });
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050708');
    scene.fog = new THREE.FogExp2('#071916', 0.04);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0.2, 4.8);

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight('#F2E9D8', 1.45);
    scene.add(ambientLight);

    const warmSpot = new THREE.PointLight('#D4B47A', 2.8, 18);
    warmSpot.position.set(0, 2.5, 2.5);
    scene.add(warmSpot);

    // Curved Panoramic Depth Stage for Authentic Resort Room Photography
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const textureLoader = new THREE.TextureLoader();
    const primaryImage = room.images[0] || '';
    const roomTexture = textureLoader.load(primaryImage);
    roomTexture.colorSpace = THREE.SRGBColorSpace;

    // Curved architectural gallery wall for immersive depth-of-field inspection
    const curvedGeo = new THREE.CylinderGeometry(6.2, 6.2, 5.2, 48, 1, true, -Math.PI * 0.42, Math.PI * 0.84);
    curvedGeo.scale(-1, 1, 1);
    const curvedMat = new THREE.MeshStandardMaterial({
      map: roomTexture,
      roughness: 0.45,
      metalness: 0.05,
    });
    const curvedBackdrop = new THREE.Mesh(curvedGeo, curvedMat);
    curvedBackdrop.position.set(0, 0.2, -0.5);
    stageGroup.add(curvedBackdrop);

    // Architectural Timber Floor & Ceiling Framing Planes for Spatial Depth
    const floorGeo = new THREE.PlaneGeometry(14, 14);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#071916',
      roughness: 0.35,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -2.4;
    stageGroup.add(floorMesh);

    // 3D Interactive Hotspot Beacons in Spatial Coordinates
    const beaconMeshes: THREE.Mesh[] = [];
    const beaconGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const ringGeo = new THREE.RingGeometry(0.16, 0.21, 24);

    room.hotspots.forEach((hs) => {
      const mat = new THREE.MeshBasicMaterial({ color: '#D4B47A' });
      const beacon = new THREE.Mesh(beaconGeo, mat);
      beacon.position.set(...hs.position);
      beacon.userData = { hotspot: hs };

      const ringMat = new THREE.MeshBasicMaterial({
        color: '#F2E9D8',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      beacon.add(ring);

      stageGroup.add(beacon);
      beaconMeshes.push(beacon);
    });

    // Pointer Orbit / Pan / Raycast Hotspot Click Interaction
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      // Check if user clicked a 3D hotspot beacon
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(beaconMeshes, false);
      if (hits.length > 0) {
        const hitHs = hits[0].object.userData.hotspot as RoomHotspot;
        if (hitHs) {
          setSelectedHotspot(hitHs);
          cameraTargetRef.current.yaw = hitHs.yaw;
          cameraTargetRef.current.pitch = hitHs.pitch;
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      cameraTargetRef.current.yaw = Math.max(
        -0.85,
        Math.min(0.85, cameraTargetRef.current.yaw - dx * 0.0035)
      );
      cameraTargetRef.current.pitch = Math.max(
        -0.35,
        Math.min(0.35, cameraTargetRef.current.pitch + dy * 0.0025)
      );
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth camera interpolation (lerp)
      const targetZ = 4.8 / cameraTargetRef.current.zoom;
      camera.position.z += (targetZ - camera.position.z) * 0.08;
      stageGroup.rotation.y += (cameraTargetRef.current.yaw - stageGroup.rotation.y) * 0.07;
      stageGroup.rotation.x += (cameraTargetRef.current.pitch - stageGroup.rotation.x) * 0.07;

      // Pulse 3D hotspot rings
      beaconMeshes.forEach((b, idx) => {
        const scale = 1 + Math.sin(t * 3 + idx) * 0.16;
        b.scale.setScalar(scale);
        b.lookAt(camera.position);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      roomTexture.dispose();
      curvedGeo.dispose();
      curvedMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      beaconGeo.dispose();
      ringGeo.dispose();
      renderer.dispose();
    };
  }, [room]);

  const handleHotspotSelect = (hs: RoomHotspot) => {
    setSelectedHotspot(hs);
    cameraTargetRef.current.yaw = hs.yaw;
    cameraTargetRef.current.pitch = hs.pitch;
  };

  const handleZoom = (delta: number) => {
    const next = Math.max(0.8, Math.min(1.65, Number((zoomLevel + delta).toFixed(2))));
    setZoomLevel(next);
    cameraTargetRef.current.zoom = next;
  };

  const handleResetCamera = () => {
    setZoomLevel(1);
    cameraTargetRef.current = { yaw: 0, pitch: 0, zoom: 1 };
  };

  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`3D Spatial Room Experience — ${room.name}`}
      className="fixed inset-0 z-50 flex flex-col bg-[#050708]/95 backdrop-blur-xl text-[#F2E9D8]"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4B47A]/20 bg-[#050708]/90">
        <div>
          <div className="text-xs text-[#D4B47A] tracking-[0.2em] uppercase">
            Cinematic Depth & Spatial Room Inspector
          </div>
          <h2 className="font-serif-display text-2xl md:text-3xl text-[#F2E9D8]">{room.name}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLightingMode((m) => (m === 'MORNING' ? 'TWILIGHT' : 'MORNING'))}
            className="px-3.5 py-2 text-xs font-medium border border-[#D4B47A]/30 rounded-lg text-[#F2E9D8] hover:border-[#D4B47A] transition-colors whitespace-nowrap cursor-pointer"
          >
            Atmosphere: {lightingMode === 'MORNING' ? 'Highland Dawn' : 'Amber Twilight'}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-2.5 border border-white/15 rounded-lg hover:border-[#D4B47A] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close 3D Room Viewer"
            className="p-2.5 bg-[#123C32] border border-[#D4B47A]/40 rounded-lg hover:bg-[#D4B47A] hover:text-[#050708] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Viewport + Sidebar */}
      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* 3D Canvas Stage */}
        <div className="relative lg:col-span-8 h-[52vh] lg:h-full bg-[#050708]">
          <div
            ref={mountRef}
            data-cursor="DRAG"
            className={`w-full h-full cursor-grab active:cursor-grabbing transition-all duration-500 ${
              lightingMode === 'TWILIGHT' ? 'sepia-[.18] brightness-90 contrast-105' : ''
            }`}
          />

          {/* Floating Camera Controls HUD */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#050708]/75 backdrop-blur-md border border-white/10 text-xs">
            <Compass className="w-4 h-4 text-[#D4B47A]" />
            <span>Drag to orbit · Select hotspots below or in 3D space</span>
          </div>

          <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-[#050708]/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              aria-label="Zoom In"
              className="p-2 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4 text-[#D4B47A]" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              aria-label="Zoom Out"
              className="p-2 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4 text-[#D4B47A]" />
            </button>
            <button
              type="button"
              onClick={handleResetCamera}
              aria-label="Reset View"
              className="p-2 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#F2E9D8]" />
            </button>
          </div>

          {/* 5 Required Interactive Hotspot Selector Bar */}
          <div className="absolute bottom-5 right-5 left-40 hidden sm:flex items-center justify-end gap-1.5 flex-wrap">
            {room.hotspots.map((hs) => {
              const active = selectedHotspot.id === hs.id;
              return (
                <button
                  key={hs.id}
                  type="button"
                  onClick={() => handleHotspotSelect(hs)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#D4B47A] text-[#050708] shadow-lg'
                      : 'bg-[#050708]/80 text-[#F2E9D8] border border-white/15 hover:border-[#D4B47A]'
                  }`}
                >
                  {hs.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Architectural Details & Hotspot Inspection Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between p-6 md:p-8 bg-[#071916] border-t lg:border-t-0 lg:border-l border-[#D4B47A]/20 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="text-xs text-[#81957A] uppercase tracking-[0.2em] mb-2">
                Verified Accommodation Category
              </div>
              <p className="text-sm text-[#E7E1D5]/90 leading-relaxed">{room.description}</p>
            </div>

            {/* Mobile Hotspot Buttons */}
            <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-2">
              {room.hotspots.map((hs) => (
                <button
                  key={hs.id}
                  type="button"
                  onClick={() => handleHotspotSelect(hs)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                    selectedHotspot.id === hs.id
                      ? 'bg-[#D4B47A] text-[#050708]'
                      : 'bg-[#092B25] text-[#F2E9D8]'
                  }`}
                >
                  {hs.label}
                </button>
              ))}
            </div>

            {/* Active Hotspot Detail Card */}
            <div className="p-5 rounded-xl bg-[#092B25]/90 border border-[#D4B47A]/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#D4B47A]">
                <span>HOTSPOT FOCUS · {selectedHotspot.label}</span>
                <span className="font-mono-tabular">3D POINT</span>
              </div>
              <h3 className="font-serif-display text-2xl text-[#F2E9D8]">{selectedHotspot.title}</h3>
              <p className="text-sm text-[#C5D1D0] leading-relaxed">{selectedHotspot.description}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-[#C5D1D0]">
              <div className="text-[#D4B47A] uppercase tracking-wider">Resort Sanctuary Note</div>
              <p>
                Room rates and specific date availability are confirmed directly by our Kodaikanal reservation desk upon receiving your booking inquiry.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookRoom(room.name);
              }}
              className="flex-1 py-3.5 px-6 bg-[#D4B47A] text-[#050708] font-semibold text-xs tracking-[0.15em] uppercase rounded-lg hover:bg-[#F2E9D8] transition-colors whitespace-nowrap cursor-pointer"
            >
              INQUIRE FOR THIS ROOM
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-5 border border-white/20 text-[#F2E9D8] text-xs tracking-wider uppercase rounded-lg hover:border-[#D4B47A] transition-colors whitespace-nowrap cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
