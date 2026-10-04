import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExperienceItem } from '../../data/resort';

interface ExperienceVisualizer3DProps {
  activeExperience: ExperienceItem;
}

export const ExperienceVisualizer3D: React.FC<ExperienceVisualizer3DProps> = ({
  activeExperience,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const visualTypeRef = useRef(activeExperience.visualType);

  useEffect(() => {
    visualTypeRef.current = activeExperience.visualType;
  }, [activeExperience.visualType]);

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
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#071916', 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 1.8, 6.2);

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight('#123C32', 1.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight('#D4B47A', 2.8);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const warmPoint = new THREE.PointLight('#C66D3D', 3.2, 12);
    warmPoint.position.set(0, 1.2, 2);
    scene.add(warmPoint);

    const stage = new THREE.Group();
    scene.add(stage);

    // Base plinth
    const plinthGeo = new THREE.CylinderGeometry(2.1, 2.3, 0.24, 36);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#092B25',
      roughness: 0.4,
      metalness: 0.3,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -1.25;
    stage.add(plinth);

    // Create sculptural 3D representations for each of the 8 experiences
    const sculptures: Record<string, THREE.Group> = {};

    // 1. Mountains
    const gMountains = new THREE.Group();
    const m1 = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: '#123C32', flatShading: true })
    );
    const m2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.95, 1.7, 6),
      new THREE.MeshStandardMaterial({ color: '#526B52', flatShading: true })
    );
    m2.position.set(0.9, -0.25, 0.4);
    const sunRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.03, 16, 48),
      new THREE.MeshBasicMaterial({ color: '#D4B47A' })
    );
    sunRing.position.set(-0.6, 0.9, -0.5);
    gMountains.add(m1, m2, sunRing);
    sculptures.mountains = gMountains;

    // 2. Garden
    const gGarden = new THREE.Group();
    const lotusMat = new THREE.MeshStandardMaterial({
      color: '#81957A',
      roughness: 0.4,
      metalness: 0.15,
    });
    for (let i = 0; i < 8; i++) {
      const petal = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), lotusMat);
      const angle = (i / 8) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.65, 0, Math.sin(angle) * 0.65);
      petal.rotation.y = -angle;
      petal.rotation.z = 0.45;
      gGarden.add(petal);
    }
    const coreGem = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 20, 20),
      new THREE.MeshStandardMaterial({ color: '#D4B47A', metalness: 0.6, roughness: 0.2 })
    );
    coreGem.position.y = 0.25;
    gGarden.add(coreGem);
    sculptures.garden = gGarden;

    // 3. Cycling
    const gCycling = new THREE.Group();
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#D4B47A', metalness: 0.7, roughness: 0.25 });
    const w1 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 16, 40), wheelMat);
    w1.position.x = -0.85;
    const w2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 16, 40), wheelMat);
    w2.position.x = 0.85;
    const frameBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.7, 12),
      new THREE.MeshStandardMaterial({ color: '#C5D1D0' })
    );
    frameBar.rotation.z = Math.PI / 2;
    frameBar.position.y = 0.15;
    gCycling.add(w1, w2, frameBar);
    sculptures.cycling = gCycling;

    // 4. Outdoor Fireplace
    const gFireplace = new THREE.Group();
    const logsMat = new THREE.MeshStandardMaterial({ color: '#9C5235', roughness: 0.8 });
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.6, 10), logsMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = (i / 4) * Math.PI;
      log.position.y = -0.6;
      gFireplace.add(log);
    }
    const flameOuter = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.75, 1),
      new THREE.MeshBasicMaterial({ color: '#C66D3D', wireframe: true })
    );
    const flameInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 1.3, 7),
      new THREE.MeshStandardMaterial({
        color: '#D4B47A',
        emissive: '#C66D3D',
        emissiveIntensity: 0.7,
        flatShading: true,
      })
    );
    flameInner.position.y = 0.2;
    gFireplace.add(flameOuter, flameInner);
    sculptures.fireplace = gFireplace;

    // 5. Table Tennis
    const gTableTennis = new THREE.Group();
    const tableMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.08, 1.25),
      new THREE.MeshStandardMaterial({ color: '#123C32', roughness: 0.3 })
    );
    tableMesh.position.y = -0.3;
    const netMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.24, 1.28),
      new THREE.MeshBasicMaterial({ color: '#F2E9D8', wireframe: true })
    );
    netMesh.position.y = -0.14;
    const pingBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 20, 20),
      new THREE.MeshStandardMaterial({ color: '#D4B47A', emissive: '#D4B47A', emissiveIntensity: 0.3 })
    );
    pingBall.name = 'pingBall';
    gTableTennis.add(tableMesh, netMesh, pingBall);
    sculptures.tabletennis = gTableTennis;

    // 6. Games Room
    const gGames = new THREE.Group();
    const die1 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.68, 0),
      new THREE.MeshStandardMaterial({ color: '#D4B47A', metalness: 0.4, roughness: 0.3, flatShading: true })
    );
    die1.position.set(-0.55, 0.15, 0);
    const die2 = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.58, 0),
      new THREE.MeshStandardMaterial({ color: '#526F7A', metalness: 0.3, roughness: 0.4, flatShading: true })
    );
    die2.position.set(0.65, -0.1, 0.2);
    gGames.add(die1, die2);
    sculptures.games = gGames;

    // 7. Indoor Play Area
    const gPlayArea = new THREE.Group();
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.08, 16, 48),
      new THREE.MeshStandardMaterial({ color: '#81957A' })
    );
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.08, 16, 48),
      new THREE.MeshStandardMaterial({ color: '#D4B47A' })
    );
    ring2.rotation.x = Math.PI / 3;
    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 24),
      new THREE.MeshStandardMaterial({ color: '#F2E9D8' })
    );
    gPlayArea.add(ring1, ring2, centerSphere);
    sculptures.playarea = gPlayArea;

    // 8. Evening Entertainment
    const gEntertainment = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#D4B47A' : '#C66D3D', metalness: 0.5, roughness: 0.25 })
      );
      bar.position.x = (i - 3) * 0.35;
      gEntertainment.add(bar);
    }
    sculptures.entertainment = gEntertainment;

    Object.values(sculptures).forEach((grp) => {
      grp.visible = false;
      stage.add(grp);
    });

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

      if (!isTabVisible || !isIntersecting) return;

      try {
        const t = clock.getElapsedTime();
        const activeKey = visualTypeRef.current;

        Object.entries(sculptures).forEach(([key, grp]) => {
          grp.visible = key === activeKey;
        });

        const activeGrp = sculptures[activeKey];
        if (activeGrp) {
          activeGrp.rotation.y = t * 0.45;

          if (activeKey === 'fireplace') {
            activeGrp.children.forEach((child, idx) => {
              if (idx >= 4) {
                child.scale.y = 1 + Math.sin(t * 6 + idx) * 0.18;
              }
            });
          } else if (activeKey === 'tabletennis') {
            const ball = activeGrp.getObjectByName('pingBall');
            if (ball) {
              ball.position.x = Math.sin(t * 3.5) * 0.85;
              ball.position.y = Math.abs(Math.cos(t * 3.5)) * 0.65 - 0.1;
            }
          } else if (activeKey === 'entertainment') {
            activeGrp.children.forEach((bar, idx) => {
              bar.scale.y = 0.5 + Math.abs(Math.sin(t * 3 + idx * 0.7)) * 0.85;
            });
          } else if (activeKey === 'cycling') {
            activeGrp.children[0].rotation.z = -t * 2.5;
            activeGrp.children[1].rotation.z = -t * 2.5;
          }
        }

        camera.lookAt(0, -0.1, 0);
        renderer.render(scene, camera);
      } catch (err) {
        console.warn('ExperienceVisualizer3D render exception caught safely:', err);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
      plinthGeo.dispose();
      plinthMat.dispose();
      renderer.dispose();
    };
  }, [isVisible]);

  if (!supported) {
    return (
      <div className="w-full h-80 rounded-xl bg-[#071916] border border-[#D4B47A]/20 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-xs text-[#D4B47A] uppercase tracking-widest mb-2">
            {activeExperience.category}
          </div>
          <div className="font-serif-display text-3xl text-[#F2E9D8]">{activeExperience.title}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-xl overflow-hidden bg-gradient-to-b from-[#092B25]/80 via-[#071916] to-[#050708] border border-[#D4B47A]/25">
      <div ref={containerRef} className="w-full h-full" data-cursor="VIEW" />
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between pointer-events-none">
        <span className="text-xs uppercase tracking-[0.2em] text-[#D4B47A]">
          3D Interactive Kinetic Study
        </span>
        <span className="text-xs text-[#C5D1D0]">{activeExperience.category}</span>
      </div>
      <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
        <h3 className="font-serif-display text-2xl md:text-3xl text-[#F2E9D8] mb-1">
          {activeExperience.title}
        </h3>
        <p className="text-xs md:text-sm text-[#C5D1D0] max-w-md">{activeExperience.description}</p>
      </div>
    </div>
  );
};
