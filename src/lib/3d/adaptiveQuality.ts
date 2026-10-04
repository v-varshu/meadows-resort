/**
 * Adaptive 3D Quality & Performance Monitor for The Meadows Resort
 * Dynamically adjusts geometry density, particle counts, and render resolution
 * based on device capabilities, user preferences, and real-time FPS monitoring.
 */

export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'MOBILE';

export interface QualityConfig {
  tier: QualityTier;
  pixelRatio: number;
  particleCount: number;
  treeCount: number;
  mountainSegments: [number, number]; // [segX, segZ]
  enableShadows: boolean;
  enableComplexAnimations: boolean;
}

// Detect initial quality tier based on hardware concurrency, memory, screen, and user settings
export function detectInitialQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'MEDIUM';

  const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) return 'MOBILE';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return 'LOW';

  // Check hardware concurrency (CPU cores) and device memory (GB)
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

  if (cores >= 8 && memory >= 8) {
    return 'HIGH';
  } else if (cores >= 4 && memory >= 4) {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
}

export function getQualityConfig(tier: QualityTier): QualityConfig {
  switch (tier) {
    case 'HIGH':
      return {
        tier: 'HIGH',
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        particleCount: 300,
        treeCount: 220,
        mountainSegments: [50, 24],
        enableShadows: true,
        enableComplexAnimations: true,
      };
    case 'MEDIUM':
      return {
        tier: 'MEDIUM',
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        particleCount: 180,
        treeCount: 140,
        mountainSegments: [40, 20],
        enableShadows: false,
        enableComplexAnimations: true,
      };
    case 'LOW':
      return {
        tier: 'LOW',
        pixelRatio: 1,
        particleCount: 80,
        treeCount: 70,
        mountainSegments: [30, 16],
        enableShadows: false,
        enableComplexAnimations: false,
      };
    case 'MOBILE':
      return {
        tier: 'MOBILE',
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.25),
        particleCount: 100,
        treeCount: 80,
        mountainSegments: [32, 16],
        enableShadows: false,
        enableComplexAnimations: false,
      };
  }
}

/**
 * Lightweight real-time FPS monitor that steps down quality tier if rendering drops.
 * Zero DOM overhead; purely numeric calculation.
 */
export class FpsMonitor {
  private lastTime: number = performance.now();
  private frames: number = 0;
  private lowFpsCounter: number = 0;
  private currentTier: QualityTier;
  private onQualityDegrade?: (newTier: QualityTier) => void;

  constructor(
    initialTier: QualityTier,
    onQualityDegrade?: (newTier: QualityTier) => void
  ) {
    this.currentTier = initialTier;
    this.onQualityDegrade = onQualityDegrade;
  }

  public tick(): void {
    this.frames++;
    const now = performance.now();
    const delta = now - this.lastTime;

    // Sample every 1000ms
    if (delta >= 1000) {
      const fps = (this.frames * 1000) / delta;
      this.frames = 0;
      this.lastTime = now;

      // If FPS drops below 26 for 2 consecutive seconds, degrade quality
      if (fps < 26) {
        this.lowFpsCounter++;
        if (this.lowFpsCounter >= 2) {
          this.degrade();
          this.lowFpsCounter = 0;
        }
      } else {
        this.lowFpsCounter = Math.max(0, this.lowFpsCounter - 1);
      }
    }
  }

  private degrade(): void {
    let nextTier: QualityTier | null = null;
    if (this.currentTier === 'HIGH') nextTier = 'MEDIUM';
    else if (this.currentTier === 'MEDIUM') nextTier = 'LOW';

    if (nextTier && nextTier !== this.currentTier) {
      this.currentTier = nextTier;
      if (this.onQualityDegrade) {
        this.onQualityDegrade(nextTier);
      }
    }
  }

  public getTier(): QualityTier {
    return this.currentTier;
  }
}
