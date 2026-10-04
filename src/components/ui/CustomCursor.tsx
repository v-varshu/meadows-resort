import React, { useEffect, useRef, useState } from 'react';

export type CursorState = 'DEFAULT' | 'VIEW' | 'EXPLORE' | 'DISCOVER' | 'BOOK' | 'DRAG';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>('DEFAULT');
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasFinePointer || reducedMotion) {
      setIsTouchDevice(true);
      return;
    }
    setIsTouchDevice(false);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) setVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Inspect target for data-cursor state
      const target = e.target as HTMLElement | null;
      const cursorEl = target?.closest?.('[data-cursor]') as HTMLElement | null;
      if (cursorEl) {
        const val = (cursorEl.getAttribute('data-cursor') || 'DEFAULT').toUpperCase() as CursorState;
        setCursorState(val);
      } else {
        setCursorState('DEFAULT');
      }
    };

    const onMouseLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    let frameId: number;
    const updateRing = () => {
      frameId = requestAnimationFrame(updateRing);
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
    };
    updateRing();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [visible]);

  if (isTouchDevice) return null;

  const isExpanded = cursorState !== 'DEFAULT';

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[90] transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Center Precision Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-[#D4B47A] pointer-events-none will-change-transform"
      />
      {/* Outer Ring / State Label */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full pointer-events-none will-change-transform transition-[width,height,margin,background-color,border-color] duration-200 ${
          isExpanded
            ? 'w-20 h-20 -ml-10 -mt-10 bg-[#050708]/85 border border-[#D4B47A] backdrop-blur-sm'
            : 'w-9 h-9 -ml-[18px] -mt-[18px] border border-[#D4B47A]/55 bg-transparent'
        }`}
      >
        {isExpanded && (
          <span className="text-[10px] font-semibold tracking-[0.18em] text-[#D4B47A] uppercase">
            {cursorState}
          </span>
        )}
      </div>
    </div>
  );
};
