import React, {useEffect, useRef, useState} from 'react';

interface Props {
  onComplete: () => void;
  duration?: number;
}

/** Cyber sci-fi boot animation — shows once per expand cycle */
const LoadingScreen: React.FC<Props> = ({onComplete, duration = 700}) => {
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
    return () => {
      if (timerRef.current !== undefined) clearInterval(timerRef.current);
    };
  }, []);

  const phases = [
    'INITIALIZING_KERNEL',
    'LOADING_MODULES',
    'ESTABLISHING_HANDSHAKE',
    'CALIBRATING_RENDERER',
    'SYSTEM_READY',
  ];

  return (
    <div className="rw-loading-screen">
      <div className="relative flex h-full w-full items-center justify-center">
        {/* Decorative cyber grid */}
        <div className="rw-loading-grid"/>

        {/* Central content */}
        <div className="z-[1] flex flex-col items-center gap-[14px]">
          <div className="rw-loading-logo">
            <span className="opacity-50">{'['}</span>
            <span className="mx-0.5">RW</span>
            <span className="opacity-50">{']'}</span>
          </div>

          <div className="rw-loading-bar">
            <div
              className="rw-loading-bar-fill"
              style={{width: `${(phase / 5) * 100}%`}}
            />
          </div>

          <div className="rw-loading-phase">
            <span className="rw-loading-cursor">▌</span>
            {phase < 5 ? phases[phase] : phases[4]}
          </div>
        </div>

        {/* Corner decorations */}
        <div className="rw-loading-corner left-[8px] top-[8px] border-l border-t"/>
        <div className="rw-loading-corner right-[8px] top-[8px] border-r border-t [animation-delay:0.3s]"/>
        <div className="rw-loading-corner bottom-[8px] left-[8px] border-b border-l [animation-delay:0.6s]"/>
        <div className="rw-loading-corner bottom-[8px] right-[8px] border-b border-r [animation-delay:0.9s]"/>
      </div>
    </div>
  );
};

export default LoadingScreen;
