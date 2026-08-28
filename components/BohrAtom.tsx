import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChemicalElement } from '../types';

interface BohrAtomProps {
  element: ChemicalElement;
  accentColor: string;
  size?: number;
  interactive?: boolean;
}

const SHELL_LABELS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

const BohrAtom: React.FC<BohrAtomProps> = ({ 
  element, 
  accentColor, 
  size = 280,
  interactive = true 
}) => {
  const shells = element.shells || [element.atomicNumber];
  const protons = element.atomicNumber;
  const neutrons = Math.max(0, Math.round(element.atomicMass) - protons);
  const totalElectrons = shells.reduce((acc, count) => acc + count, 0);

  const radiusStep = useMemo(() => {
    const maxRadius = (size / 2) - 18;
    const minRadius = 38;
    const count = Math.max(1, shells.length);
    if (count === 1) return maxRadius - minRadius;
    return (maxRadius - minRadius) / (count - 1 || 1);
  }, [shells.length, size]);

  const center = size / 2;

  return (
    <div className="flex flex-col items-center select-none">
      <div 
        className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-black/40 border border-white/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
        style={{ width: size, height: size }}
      >
        {/* Background glow */}
        <div 
          className="absolute w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />

        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-10"
        >
          <defs>
            <radialGradient id={`nucleus-grad-${element.atomicNumber}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
              <stop offset="60%" stopColor={accentColor} stopOpacity={0.8} />
              <stop offset="100%" stopColor="#000000" stopOpacity={0.9} />
            </radialGradient>
            
            <filter id={`glow-${element.atomicNumber}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Orbit Rings and Revolving Electrons */}
          {shells.map((count, shellIdx) => {
            const shellRadius = 38 + (shellIdx * radiusStep);
            const duration = 8 + shellIdx * 4; // Outer shells orbit slower
            const isClockwise = shellIdx % 2 === 0;

            // Generate angle offsets for electrons in this shell
            const angles = Array.from({ length: count }, (_, i) => (360 / count) * i);

            return (
              <g key={`shell-${shellIdx}`}>
                {/* Orbit track */}
                <circle
                  cx={center}
                  cy={center}
                  r={shellRadius}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.3"
                  className="transition-all duration-500"
                />

                {/* Rotating group for this shell's electrons */}
                <g
                  style={{
                    transformOrigin: `${center}px ${center}px`,
                    animation: `spin ${duration}s linear infinite ${isClockwise ? 'normal' : 'reverse'}`,
                  }}
                >
                  {angles.map((deg, electronIdx) => {
                    const rad = (deg * Math.PI) / 180;
                    const ex = center + shellRadius * Math.cos(rad);
                    const ey = center + shellRadius * Math.sin(rad);

                    return (
                      <g key={`e-${shellIdx}-${electronIdx}`}>
                        {/* Electron outer halo */}
                        <circle
                          cx={ex}
                          cy={ey}
                          r={3.5}
                          fill={accentColor}
                          fillOpacity="0.4"
                          filter={`url(#glow-${element.atomicNumber})`}
                        />
                        {/* Electron core */}
                        <circle
                          cx={ex}
                          cy={ey}
                          r={2}
                          fill="#ffffff"
                        />
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}

          {/* Central Nucleus */}
          <g className="cursor-pointer">
            <circle
              cx={center}
              cy={center}
              r={22}
              fill={`url(#nucleus-grad-${element.atomicNumber})`}
              filter={`url(#glow-${element.atomicNumber})`}
              className="drop-shadow-lg transition-transform duration-300 hover:scale-110"
            />
            {/* Nucleus inner highlight */}
            <circle
              cx={center - 5}
              cy={center - 5}
              r={5}
              fill="#ffffff"
              fillOpacity="0.4"
            />
            {/* Element Symbol */}
            <text
              x={center}
              y={center + 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="900"
              fontFamily="monospace"
              className="pointer-events-none drop-shadow"
            >
              {element.symbol}
            </text>
          </g>
        </svg>

        {/* Nucleus Badge Info */}
        <div className="absolute top-2 left-3 flex flex-col gap-0.5 text-[8px] font-mono text-white/50">
          <span>p⁺: <strong className="text-white">{protons}</strong></span>
          <span>n⁰: <strong className="text-white">{neutrons}</strong></span>
        </div>

        <div className="absolute top-2 right-3 text-[8px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          e⁻: {totalElectrons}
        </div>
      </div>

      {/* Interactive Shell Breakdown Chips */}
      {interactive && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 max-w-[280px]">
          {shells.map((count, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono"
            >
              <span className="font-bold text-white/40">{SHELL_LABELS[idx] || `S${idx + 1}`}:</span>
              <span className="font-black" style={{ color: accentColor }}>{count}</span>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BohrAtom;

