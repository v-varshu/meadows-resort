import React, { useEffect, useState } from 'react';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(40);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(90), 80);
    const t2 = setTimeout(() => {
      setProgress(100);
      setComplete(true);
    }, 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (complete) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#D4B47A] via-[#F2E9D8] to-[#D4B47A] transition-all duration-200 ease-out shadow-[0_0_8px_#D4B47A]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
