import React from 'react';
import { motion } from 'framer-motion';
import { ChemicalElement, Language, PropertyKey } from '../types';

interface ElementCardProps {
  element: ChemicalElement;
  onClick: (element: ChemicalElement) => void;
  onHover: (id: number | null) => void;
  isMuted?: boolean;
  isFocused?: boolean;
  categoryColorClass: string;
  lang?: Language;
  temperatureK?: number | null;
  heatmapRatio?: number | null; // 0 to 1 for heatmap mode
  heatmapProperty?: PropertyKey | null;
}

const ElementCard: React.FC<ElementCardProps> = ({ 
  element, 
  onClick, 
  onHover,
  isMuted,
  isFocused,
  categoryColorClass,
  lang = 'en',
  temperatureK = null,
  heatmapRatio = null,
  heatmapProperty = null
}) => {
  // Determine dynamic physical state at current temperature
  const dynamicState = React.useMemo(() => {
    if (temperatureK === null) return element.state;
    if (element.meltingPoint === null && element.boilingPoint === null) return 'unknown';

    const mp = element.meltingPoint ?? -Infinity;
    const bp = element.boilingPoint ?? Infinity;

    if (temperatureK < mp) return 'solid';
    if (temperatureK >= mp && temperatureK < bp) return 'liquid';
    if (temperatureK >= bp) return 'gas';
    return 'unknown';
  }, [element.meltingPoint, element.boilingPoint, element.state, temperatureK]);

  // Generate heatmap color based on ratio 0 to 1
  const getHeatmapColor = (ratio: number) => {
    // Gradient from deep blue (0) -> cyan (0.3) -> emerald (0.5) -> yellow (0.75) -> rose/red (1.0)
    const hue = (1 - ratio) * 240; // 240 (blue) down to 0 (red)
    return `hsl(${hue}, 90%, 55%)`;
  };

  // Base RGB styling
  const getGlowStyles = (category: string, isActive: boolean, isMuted: boolean, heatmapRatio: number | null) => {
    if (heatmapRatio !== null) {
      const colorHsl = getHeatmapColor(heatmapRatio);
      const opacity = isMuted ? 0.2 : 0.85;
      return {
        style: {
          borderColor: colorHsl,
          boxShadow: isActive ? `0 0 20px ${colorHsl}, inset 0 0 10px ${colorHsl}` : `0 0 8px ${colorHsl}40`,
          backgroundColor: `${colorHsl}15`,
        },
        textStyle: {
          color: isMuted ? '#64748b' : '#ffffff',
          textShadow: isMuted ? 'none' : `0 0 8px ${colorHsl}`,
        },
        subTextStyle: {
          color: colorHsl,
        }
      };
    }

    let color = '56, 189, 248'; // Default sky
    if (category.includes('sky')) color = '56, 189, 248';
    else if (category.includes('violet')) color = '167, 139, 250';
    else if (category.includes('red')) color = '239, 68, 68';
    else if (category.includes('orange')) color = '249, 115, 22';
    else if (category.includes('cyan')) color = '34, 211, 238';
    else if (category.includes('emerald')) color = '52, 211, 153';
    else if (category.includes('green')) color = '74, 222, 128';
    else if (category.includes('yellow')) color = '250, 204, 21';
    else if (category.includes('pink')) color = '244, 114, 182';
    else if (category.includes('rose')) color = '251, 113, 133';

    const borderOpacity = isMuted ? 0.2 : 0.7;
    const baseShadow = isActive 
      ? `0 0 16px rgba(${color}, 0.9), 0 0 32px rgba(${color}, 0.5), inset 0 0 12px rgba(${color}, 0.5)`
      : `0 0 8px rgba(${color}, 0.35), inset 0 0 6px rgba(${color}, 0.2)`;

    return {
      style: {
        borderColor: `rgba(${color}, ${borderOpacity})`,
        boxShadow: baseShadow,
        backgroundColor: `rgba(${color}, ${isActive ? 0.18 : 0.06})`,
      },
      textStyle: {
        color: `rgba(${color}, ${isMuted ? 0.3 : 1})`,
        textShadow: isMuted ? 'none' : `0 0 8px rgba(${color}, 0.6)`,
      },
      subTextStyle: {
        color: `rgba(${color}, ${isMuted ? 0.25 : 0.85})`,
      }
    };
  };

  const glow = getGlowStyles(categoryColorClass, !!isFocused, !!isMuted, heatmapRatio);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'solid': return 'bg-amber-400';
      case 'liquid': return 'bg-sky-400';
      case 'gas': return 'bg-rose-400';
      default: return 'bg-slate-400';
    }
  };

  const displayName = lang === 'bn' ? element.bengaliName : element.name;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.12, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        filter: isMuted ? 'brightness(0.5) saturate(0.4)' : 'brightness(1.1) saturate(1.2)',
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`relative w-full aspect-square p-0.5 cursor-pointer group transition-all duration-300 ${isFocused ? 'z-30' : 'z-10'}`}
      style={{ gridColumn: element.xpos, gridRow: element.ypos }}
      onClick={() => onClick(element)}
      onMouseEnter={() => onHover(element.atomicNumber)}
      onMouseLeave={() => onHover(null)}
    >
      <div 
        className="w-full h-full flex flex-col items-center justify-between p-1 rounded-lg border transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
        style={glow.style}
      >
        {/* Top bar: Atomic Number & State Indicator */}
        <div className="w-full flex justify-between items-center">
          <span className="text-[7px] md:text-[8px] font-mono font-bold" style={glow.subTextStyle}>
            {element.atomicNumber}
          </span>

          {/* Temperature state badge dot */}
          {temperatureK !== null && (
            <span 
              title={`State at ${temperatureK}K: ${dynamicState}`}
              className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor] ${getStateColor(dynamicState)}`}
            />
          )}

          {temperatureK === null && (
            <span className="text-[5px] font-mono uppercase opacity-50 tracking-tighter" style={glow.subTextStyle}>
              {element.block}
            </span>
          )}
        </div>

        {/* Center: Symbol & Name */}
        <div className="flex flex-col items-center justify-center -mt-0.5 w-full">
          <span className="text-sm md:text-xl font-black leading-none" style={glow.textStyle}>
            {element.symbol}
          </span>
          <span className="text-[5px] md:text-[7px] font-bold uppercase tracking-tighter mt-0.5 text-center leading-tight truncate w-full px-0.5" style={glow.textStyle}>
            {displayName}
          </span>
          <span className="text-[5px] md:text-[6px] font-mono opacity-70 mt-0.5" style={glow.subTextStyle}>
            {heatmapProperty ? (element[heatmapProperty] ?? '—') : element.atomicMass}
          </span>
        </div>

        <div className="w-full h-0.5" />
      </div>
    </motion.div>
  );
};

export default ElementCard;
