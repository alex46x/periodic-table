
import React from 'react';
import { motion } from 'framer-motion';
import { ChemicalElement } from '../types';

interface ElementCardProps {
  element: ChemicalElement;
  onClick: (element: ChemicalElement) => void;
  onHover: (id: number | null) => void;
  isMuted?: boolean;
  isFocused?: boolean;
  categoryColorClass: string;
}

const ElementCard: React.FC<ElementCardProps> = ({ 
  element, 
  onClick, 
  onHover,
  isMuted,
  isFocused,
  categoryColorClass
}) => {
  // Extract RGB based on category to create high-intensity glow effects
  const getGlowStyles = (category: string, isActive: boolean, isMuted: boolean) => {
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

    const opacity = isMuted ? 0.2 : 0.8;
    const textOpacity = isMuted ? 0.3 : 1;
    const borderOpacity = isMuted ? 0.2 : 0.7;

    const baseShadow = isActive 
      ? `0 0 15px rgba(${color}, 0.8), 0 0 30px rgba(${color}, 0.4), inset 0 0 12px rgba(${color}, 0.5)`
      : `0 0 8px rgba(${color}, 0.4), inset 0 0 6px rgba(${color}, 0.3)`;

    return {
      style: {
        borderColor: `rgba(${color}, ${borderOpacity})`,
        boxShadow: baseShadow,
        backgroundColor: `rgba(${color}, ${isActive ? 0.15 : 0.05})`,
      },
      textStyle: {
        color: `rgba(${color}, ${textOpacity})`,
        textShadow: isMuted ? 'none' : `0 0 8px rgba(${color}, 0.6)`,
      },
      subTextStyle: {
        color: `rgba(${color}, ${textOpacity * 0.8})`,
      }
    };
  };

  const glow = getGlowStyles(categoryColorClass, !!isFocused, !!isMuted);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.1, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        filter: isMuted ? 'brightness(0.6) saturate(0.5)' : 'brightness(1.1) saturate(1.2)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative w-full aspect-square p-0.5 cursor-pointer group transition-all duration-300 ${isFocused ? 'z-30' : 'z-10'}`}
      style={{ gridColumn: element.xpos, gridRow: element.ypos }}
      onClick={() => onClick(element)}
      onMouseEnter={() => onHover(element.atomicNumber)}
      onMouseLeave={() => onHover(null)}
    >
      <div 
        className="w-full h-full flex flex-col items-center justify-between p-1 rounded-sm border transition-all duration-300 relative"
        style={glow.style}
      >
        <div className="w-full flex justify-start">
          <span className="text-[7px] md:text-[8px] font-mono font-bold" style={glow.subTextStyle}>
            {element.atomicNumber}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center -mt-1">
          <span className="text-sm md:text-xl font-bold leading-none" style={glow.textStyle}>
            {element.symbol}
          </span>
          <span className="text-[5px] md:text-[7px] font-bold uppercase tracking-tighter mt-0.5 text-center leading-tight truncate w-full px-0.5" style={glow.textStyle}>
            {element.name}
          </span>
          <span className="text-[5px] md:text-[6px] font-mono opacity-60 mt-0.5" style={glow.subTextStyle}>
            {element.atomicMass}
          </span>
        </div>

        <div className="w-full h-0.5" />
      </div>
    </motion.div>
  );
};

export default ElementCard;
