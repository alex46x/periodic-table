
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChemicalElement } from '../types';
import { CATEGORY_COLORS } from '../data';
import { X, Beaker, Thermometer, Wind, Zap, History, ChevronRight } from 'lucide-react';

interface DetailPanelProps {
  element: ChemicalElement | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ element, onClose }) => {
  if (!element) return null;

  const categoryClass = CATEGORY_COLORS[element.category] || 'from-slate-500/20 to-slate-400/20';
  
  const getGroupColorHex = (category: string) => {
    if (category.includes('sky')) return '#38bdf8';
    if (category.includes('violet')) return '#a78bfa';
    if (category.includes('red')) return '#ff1010ff';
    if (category.includes('orange')) return '#ff6b01ff';
    if (category.includes('cyan')) return '#22d3ee';
    if (category.includes('emerald')) return '#34d399';
    if (category.includes('green')) return '#4ade80';
    if (category.includes('yellow')) return '#facc15';
    if (category.includes('pink')) return '#ff0084ff';
    if (category.includes('rose')) return '#fb7185';
    return '#ffffff';
  };

  const accentColor = getGroupColorHex(categoryClass);

  const PropertyCard = ({ icon: Icon, label, value, unit, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      // whileHover={{ y: -2, backgroundColor: 'rgba(24, 129, 179, 0.94)' }}
      whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.07)' }}
      className="flex flex-col gap-2 p-4 glass rounded-2xl border border-white/5 transition-colors relative group overflow-hidden"
    >
      <div 
        className="p-2 w-fit rounded-lg bg-white/5 ring-1 ring-white/10 group-hover:ring-white/30 transition-all"
        style={{ color: accentColor }}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-0.5">{label}</p>
        <p className="text-lg font-bold text-slate-100 flex items-baseline gap-1">
          {value || '—'} <span className="text-[10px] text-slate-500 font-medium">{unit}</span>
        </p>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 150 }}
        className="fixed top-0 right-0 h-full w-full md:w-[440px] z-[70] glass-nav border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] flex flex-col"
      >
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start mb-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <span 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border text-[10px] font-bold tracking-[0.2em] uppercase font-mono"
                style={{ borderColor: `${accentColor}40`, color: accentColor }}
              >
                Atomic Node {element.atomicNumber}
              </span>
            </motion.div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-end gap-6 mb-8">
            <div className="relative group">
               <div className="absolute inset-0 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: accentColor }} />
               <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-32 h-32 glass rounded-3xl flex items-center justify-center relative z-10 border transition-colors`}
                style={{ borderColor: `${accentColor}60` }}
               >
                <span className="text-6xl font-medium text-white drop-shadow-lg">
                  {element.symbol}
                </span>
               </motion.div>
            </div>
            <div className="pb-2">
              <h2 className="text-4xl font-bold text-white tracking-tight leading-none mb-2">{element.name}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{element.category}</p>
              </div>
            </div>
          </div>
          
          <div className="h-[1px] w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 no-scrollbar space-y-10">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-5 ml-1 flex items-center gap-2">
              <ChevronRight size={10} style={{ color: accentColor }} />
              Atomic Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <PropertyCard icon={Beaker} label="Atomic Mass" value={element.atomicMass} unit="AMU" delay={0.1} />
              <PropertyCard icon={Wind} label="Density" value={element.density} unit="g/cm³" delay={0.15} />
              <PropertyCard icon={Thermometer} label="Melting Point" value={element.meltingPoint} unit="K" delay={0.2} />
              <PropertyCard icon={Zap} label="Electronegativity" value={element.electronegativity} unit="Pauling" delay={0.25} />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-5 ml-1 flex items-center gap-2">
              <ChevronRight size={10} style={{ color: accentColor }} />
              Electronic Shells
            </h3>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-[2px] h-full opacity-60 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }} />
              
              <div className="mb-6">
                <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: accentColor }}>Configuration</p>
                <code className="block text-xs font-mono text-slate-100 bg-black/60 px-4 py-3 rounded-xl border border-white/10">
                  {element.electronConfiguration}
                </code>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-3 text-white/40">Descriptor</p>
                <p className="text-[14px] text-slate-300 leading-relaxed font-light">
                  {element.summary}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/5">
                <History size={14} className="text-slate-600" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">Provenance</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {element.yearDiscovered === 'Ancient' ? 'Antiquity' : `Documented ${element.yearDiscovered}`}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="pt-8 pb-12 flex flex-col items-center opacity-10">
            <div className="w-12 h-[1px] bg-white mb-4" />
            <p className="text-[8px] uppercase tracking-[0.4em] font-bold text-white">Quantum Data Integrity Verified</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailPanel;
