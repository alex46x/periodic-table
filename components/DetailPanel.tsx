import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChemicalElement, Language } from '../types';
import { CATEGORY_COLORS } from '../data';
import { 
  X, 
  Beaker, 
  Thermometer, 
  Wind, 
  Zap, 
  History, 
  ChevronRight, 
  Sparkles, 
  Scale, 
  Layers, 
  Lightbulb 
} from 'lucide-react';
import BohrAtom from './BohrAtom';

interface DetailPanelProps {
  element: ChemicalElement | null;
  onClose: () => void;
  onOpenCompare?: (element: ChemicalElement) => void;
  lang?: Language;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ 
  element, 
  onClose, 
  onOpenCompare,
  lang = 'en' 
}) => {
  if (!element) return null;

  const categoryClass = CATEGORY_COLORS[element.category] || 'from-slate-500/20 to-slate-400/20';
  
  const getGroupColorHex = (category: string) => {
    if (category.includes('sky')) return '#38bdf8';
    if (category.includes('violet')) return '#a78bfa';
    if (category.includes('red')) return '#ef4444';
    if (category.includes('orange')) return '#f97316';
    if (category.includes('cyan')) return '#22d3ee';
    if (category.includes('emerald')) return '#34d399';
    if (category.includes('green')) return '#4ade80';
    if (category.includes('yellow')) return '#facc15';
    if (category.includes('pink')) return '#f472b6';
    if (category.includes('rose')) return '#fb7185';
    return '#38bdf8';
  };

  const accentColor = getGroupColorHex(categoryClass);

  const PropertyCard = ({ icon: Icon, label, bengaliLabel, value, unit, delay }: any) => {
    const displayLabel = lang === 'bn' ? bengaliLabel : label;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.07)' }}
        className="flex flex-col gap-1.5 p-3.5 glass rounded-2xl border border-white/5 transition-all relative group overflow-hidden"
      >
        <div 
          className="p-1.5 w-fit rounded-lg bg-white/5 ring-1 ring-white/10 group-hover:ring-white/30 transition-all"
          style={{ color: accentColor }}
        >
          <Icon size={14} />
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-0.5">{displayLabel}</p>
          <p className="text-base font-black text-slate-100 flex items-baseline gap-1">
            {value !== null && value !== undefined ? value : '—'}{' '}
            <span className="text-[9px] text-slate-400 font-medium">{unit}</span>
          </p>
        </div>
      </motion.div>
    );
  };

  const displayName = lang === 'bn' ? element.bengaliName : element.name;
  const displayCategory = lang === 'bn' ? element.bengaliCategory : element.category;
  const displaySummary = lang === 'bn' ? element.bengaliSummary : element.summary;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 160 }}
        className="fixed top-0 right-0 h-full w-full md:w-[480px] z-[80] glass-nav border-l border-white/10 shadow-[-25px_0_70px_rgba(0,0,0,0.85)] flex flex-col backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="p-6 md:p-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <span 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border text-[10px] font-bold tracking-[0.2em] uppercase font-mono"
                style={{ borderColor: `${accentColor}40`, color: accentColor }}
              >
                {lang === 'bn' ? `পরমাণু #${element.atomicNumber}` : `Atomic Node ${element.atomicNumber}`}
                <span className="opacity-60">• {element.block.toUpperCase()}-Block</span>
              </span>
            </motion.div>

            <div className="flex items-center gap-2">
              {onOpenCompare && (
                <button
                  onClick={() => onOpenCompare(element)}
                  title={lang === 'bn' ? 'তুলনা করুন' : 'Compare element'}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-400 flex items-center gap-1.5 transition-all"
                >
                  <Scale size={13} />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'তুলনা' : 'Compare'}</span>
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white border border-transparent hover:border-white/10"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-end gap-6 mb-6">
            <div className="relative group">
               <div className="absolute inset-0 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: accentColor }} />
               <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-28 h-28 glass rounded-3xl flex items-center justify-center relative z-10 border transition-colors shadow-2xl`}
                style={{ borderColor: `${accentColor}70` }}
               >
                <span className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  {element.symbol}
                </span>
               </motion.div>
            </div>
            <div className="pb-1 flex-1">
              <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-1.5">{displayName}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">{displayCategory}</p>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1.5">
                {lang === 'bn' ? 'অবস্থা:' : 'State:'} <span className="text-white font-bold capitalize">{element.state}</span>
              </p>
            </div>
          </div>
          
          <div className="h-[1px] w-full bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 no-scrollbar space-y-8">
          {/* Bohr Atom Model */}
          <section className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-1.5">
                <ChevronRight size={10} style={{ color: accentColor }} />
                {lang === 'bn' ? 'বোর পরমাণু মডেল (অরবিট অ্যানিমেশন)' : 'Bohr Atomic Orbit Simulation'}
              </h3>
            </div>
            <BohrAtom element={element} accentColor={accentColor} size={240} interactive={true} />
          </section>

          {/* Physical & Chemical Parameters */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3 ml-1 flex items-center gap-2">
              <ChevronRight size={10} style={{ color: accentColor }} />
              {lang === 'bn' ? 'পারমাণবিক পরামিতি' : 'Atomic & Chemical Parameters'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <PropertyCard icon={Beaker} label="Atomic Mass" bengaliLabel="পারমাণবিক ভর" value={element.atomicMass} unit="AMU" delay={0.05} />
              <PropertyCard icon={Wind} label="Density" bengaliLabel="ঘনত্ব" value={element.density} unit="g/cm³" delay={0.1} />
              <PropertyCard icon={Thermometer} label="Melting Point" bengaliLabel="গলনাঙ্ক" value={element.meltingPoint} unit="K" delay={0.15} />
              <PropertyCard icon={Thermometer} label="Boiling Point" bengaliLabel="স্ফুটনাঙ্ক" value={element.boilingPoint} unit="K" delay={0.2} />
              <PropertyCard icon={Zap} label="Electronegativity" bengaliLabel="তড়িৎ-ঋণাত্মকতা" value={element.electronegativity} unit="Pauling" delay={0.25} />
              <PropertyCard icon={Zap} label="Ionization Energy" bengaliLabel="আয়নীয়করণ শক্তি" value={element.ionizationEnergy} unit="kJ/mol" delay={0.3} />
              <PropertyCard icon={Scale} label="Atomic Radius" bengaliLabel="পারমাণবিক ব্যাসার্ধ" value={element.atomicRadius} unit="pm" delay={0.35} />
              <PropertyCard icon={Layers} label="Oxidation States" bengaliLabel="জারণ সংখ্যা" value={element.oxidationStates} unit="" delay={0.4} />
            </div>
          </section>

          {/* Electronic Configuration & Description */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3 ml-1 flex items-center gap-2">
              <ChevronRight size={10} style={{ color: accentColor }} />
              {lang === 'bn' ? 'ইলেকট্রন বিন্যাস ও বিস্তারিত' : 'Electronic Configuration & Summary'}
            </h3>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5 border-white/5 relative overflow-hidden space-y-4"
            >
              <div className="absolute top-0 left-0 w-[2px] h-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }} />
              
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-2 text-slate-400">
                  {lang === 'bn' ? 'ইলেকট্রন বিন্যাস' : 'Electron Configuration'}
                </p>
                <code className="block text-xs font-mono text-cyan-300 bg-black/60 px-4 py-2.5 rounded-xl border border-white/10 font-bold">
                  {element.electronConfiguration}
                </code>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-2 text-slate-400">
                  {lang === 'bn' ? 'সারসংক্ষেপ' : 'Description'}
                </p>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {displaySummary}
                </p>
              </div>

              {/* Fun Fact / Real-world Application */}
              {element.funFact && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
                  <Lightbulb size={16} className="shrink-0 mt-0.5 text-amber-400" />
                  <div className="text-xs leading-relaxed">
                    <strong className="block text-[10px] uppercase font-black tracking-wider text-amber-400 mb-0.5">
                      {lang === 'bn' ? 'বাস্তব জীবনের তথ্য ও ব্যবহার' : 'Everyday Application & Fact'}
                    </strong>
                    <span>{element.funFact}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <History size={14} className="text-slate-500" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                    {lang === 'bn' ? 'আবিষ্কার ও ইতিহাস' : 'Discovery & Provenance'}
                  </p>
                  <p className="text-xs text-slate-300 font-medium">
                    {element.discoveredBy} ({element.yearDiscovered === 'Ancient' ? (lang === 'bn' ? 'প্রাচীনকাল' : 'Antiquity') : element.yearDiscovered})
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="pt-4 pb-10 flex flex-col items-center opacity-25">
            <div className="w-12 h-[1px] bg-white mb-2" />
            <p className="text-[8px] uppercase tracking-[0.4em] font-bold text-white">ElementX Quantum Protocol v4.5</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailPanel;
