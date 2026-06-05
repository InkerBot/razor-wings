import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onComplete: () => void;
  duration?: number;
}

/** Cyber sci-fi boot animation — shows once per expand cycle */
const LoadingScreen: React.FC<Props> = ({ onComplete, duration = 700 }) => {
  const [phase, setPhase] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const step = duration / 5;
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setPhase(i);
      if (i >= 5) {
        clearInterval(timerRef.current);
        setTimeout(onComplete, 150);
      }
    }, step);
    return () => { if (timerRef.current !== undefined) clearInterval(timerRef.current); };
  }, []);

  const phases = [
    'INITIALIZING_KERNEL',
    'LOADING_MODULES',
    'ESTABLISHING_HANDSHAKE',
    'CALIBRATING_RENDERER',
    'SYSTEM_READY',
  ];

  return (
    <div className="loading-screen">
      <div className="loading-screen-inner">
        {/* Decorative cyber grid */}
        <div className="loading-grid" />

        {/* Central content */}
        <div className="loading-center">
          <div className="loading-logo">
            <span className="loading-bracket">{'['}</span>
            <span className="loading-rw">RW</span>
            <span className="loading-bracket">{']'}</span>
          </div>

          <div className="loading-bar-track">
            <div
              className="loading-bar-fill"
              style={{ width: `${(phase / 5) * 100}%` }}
            />
          </div>

          <div className="loading-status">
            <span className="loading-cursor">▌</span>
            {phase < 5 ? phases[phase] : phases[4]}
          </div>
        </div>

        {/* Corner decorations */}
        <div className="loading-corner tl" />
        <div className="loading-corner tr" />
        <div className="loading-corner bl" />
        <div className="loading-corner br" />
      </div>
    </div>
  );
};

export default LoadingScreen;
