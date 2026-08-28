import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRightLeft, 
  Scale, 
  Zap, 
  Thermometer, 
  Wind, 
  Beaker, 
  Check, 
  ChevronDown, 
  Search 
} from 'lucide-react';
import { ChemicalElement, Language } from '../types';
import { ELEMENTS, CATEGORY_COLORS } from '../data';
import BohrAtom from './BohrAtom';

interface CompareModalProps {
  initialElementA?: ChemicalElement | null;
  initialElementB?: ChemicalElement | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

// Custom Glassmorphism Searchable Dropdown for Elements
interface ElementDropdownProps {
  selectedElement: ChemicalElement;
  onSelect: (element: ChemicalElement) => void;
  accentColor: string;
  lang: Language;
}

const ElementDropdown: React.FC<ElementDropdownProps> = ({
  selectedElement,
  onSelect,
  accentColor,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredElements = useMemo(() => {
    if (!query.trim()) return ELEMENTS;
    const q = query.trim().toLowerCase();
    return ELEMENTS.filter(e => {
      const matchName = e.name.toLowerCase().includes(q);
      const matchBn = e.bengaliName.toLowerCase().includes(q);
      const matchSym = e.symbol.toLowerCase() === q || e.symbol.toLowerCase().startsWith(q);
      const matchNum = e.atomicNumber.toString() === q;
      return matchName || matchBn || matchSym || matchNum;
    });
  }, [query]);

  return (
    <div ref={dropdownRef} className="relative select-none z-30">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 border text-xs font-mono text-white transition-all shadow-lg"
        style={{ borderColor: `${accentColor}60` }}
      >
        <span 
          className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
          style={{ backgroundColor: accentColor, color: accentColor }} 
        />
        <span className="font-bold font-mono">
          #{selectedElement.atomicNumber} {selectedElement.symbol}
        </span>
        <span className="text-slate-300 truncate max-w-[100px] sm:max-w-[130px]">
          {lang === 'bn' ? selectedElement.bengaliName : selectedElement.name}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} 
        />
      </button>

      {/* Custom Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950/95 border border-white/20 shadow-[0_15px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-2.5 z-50 overflow-hidden"
          >
            {/* Search Input */}
            <div className="relative flex items-center mb-2 px-1">
              <Search size={13} className="absolute left-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === 'bn' ? "খুঁজুন (Gold, সোনা, Au, 79)..." : "Search (Gold, Au, 79)..."}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-white p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Scrollable Elements List */}
            <div className="max-h-56 overflow-y-auto no-scrollbar space-y-1 pr-1">
              {filteredElements.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 font-mono">
                  {lang === 'bn' ? 'কোনো মৌল পাওয়া যায়নি' : 'No elements found'}
                </div>
              ) : (
                filteredElements.map((el) => {
                  const isSelected = el.atomicNumber === selectedElement.atomicNumber;
                  const catClass = CATEGORY_COLORS[el.category] || '';
                  
                  return (
                    <button
                      key={el.atomicNumber}
                      type="button"
                      onClick={() => {
                        onSelect(el);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs font-mono group ${
                        isSelected 
                          ? 'bg-cyan-500/20 text-white border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]' 
                          : 'hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center font-bold text-xs text-cyan-400 group-hover:scale-105 transition-transform">
                          {el.symbol}
                        </span>
                        <div>
                          <p className="font-bold text-white leading-tight">
                            {lang === 'bn' ? el.bengaliName : el.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            #{el.atomicNumber} • {el.block.toUpperCase()}-block • {el.atomicMass} AMU
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check size={14} className="text-cyan-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CompareModal: React.FC<CompareModalProps> = ({
  initialElementA,
  initialElementB,
  isOpen,
  onClose,
  lang,
}) => {
  const [elemAId, setElemAId] = useState<number>(initialElementA?.atomicNumber || 1); // Default H
  const [elemBId, setElemBId] = useState<number>(initialElementB?.atomicNumber || 79); // Default Au

  if (!isOpen) return null;

  const elemA = ELEMENTS.find(e => e.atomicNumber === elemAId) || ELEMENTS[0];
  const elemB = ELEMENTS.find(e => e.atomicNumber === elemBId) || ELEMENTS[78];

  const getAccentColor = (category: string) => {
    const categoryClass = CATEGORY_COLORS[category] || '';
    if (categoryClass.includes('sky')) return '#38bdf8';
    if (categoryClass.includes('violet')) return '#a78bfa';
    if (categoryClass.includes('red')) return '#ef4444';
    if (categoryClass.includes('orange')) return '#f97316';
    if (categoryClass.includes('cyan')) return '#22d3ee';
    if (categoryClass.includes('emerald')) return '#34d399';
    if (categoryClass.includes('green')) return '#4ade80';
    if (categoryClass.includes('yellow')) return '#facc15';
    if (categoryClass.includes('pink')) return '#f472b6';
    if (categoryClass.includes('rose')) return '#fb7185';
    return '#38bdf8';
  };

  const colorA = getAccentColor(elemA.category);
  const colorB = getAccentColor(elemB.category);

  interface MetricRowProps {
    label: string;
    bengaliLabel: string;
    valA: number | null | undefined;
    valB: number | null | undefined;
    unit: string;
    icon: any;
  }

  const MetricRow: React.FC<MetricRowProps> = ({
    label,
    bengaliLabel,
    valA,
    valB,
    unit,
    icon: Icon,
  }) => {
    const numA = typeof valA === 'number' ? valA : null;
    const numB = typeof valB === 'number' ? valB : null;
    const maxVal = Math.max(numA || 0, numB || 0) || 1;

    const percentA = numA !== null ? Math.min(100, Math.max(8, (numA / maxVal) * 100)) : 0;
    const percentB = numB !== null ? Math.min(100, Math.max(8, (numB / maxVal) * 100)) : 0;

    const displayLabel = lang === 'bn' ? bengaliLabel : label;

    return (
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span className="font-mono text-base font-black" style={{ color: colorA }}>
            {numA !== null ? `${numA} ${unit}` : '—'}
          </span>
          <div className="flex items-center gap-1.5 uppercase tracking-widest text-[10px] text-slate-300">
            <Icon size={12} className="text-cyan-400" />
            <span>{displayLabel}</span>
          </div>
          <span className="font-mono text-base font-black" style={{ color: colorB }}>
            {numB !== null ? `${numB} ${unit}` : '—'}
          </span>
        </div>

        {/* Comparison Bars */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Bar A (Right to Left) */}
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden flex justify-end">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentA}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ backgroundColor: colorA }}
            />
          </div>

          {/* Bar B (Left to Right) */}
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden flex justify-start">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentB}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ backgroundColor: colorB }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] glass rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 md:px-8 py-4 sm:py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Scale size={18} />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
                  {lang === 'bn' ? 'মৌল তুলনা টুল' : 'Element Comparison Engine'}
                </h2>
                <p className="text-[10px] text-white/50 tracking-widest uppercase">
                  {lang === 'bn' ? 'পাশাপাশি ধর্মের তুলনামূলক বিশ্লেষণ' : 'Side-by-Side Chemical Analysis'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-8 no-scrollbar">
            {/* Element Selectors Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Center Swap Icon */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass items-center justify-center border border-white/20 shadow-xl pointer-events-none">
                <ArrowRightLeft size={16} className="text-cyan-400" />
              </div>

              {/* Element A Card */}
              <div 
                className="p-5 sm:p-6 rounded-2xl border transition-all relative"
                style={{ backgroundColor: `${colorA}08`, borderColor: `${colorA}40` }}
              >
                <div className="flex items-center justify-between mb-4 gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest shrink-0" style={{ color: colorA }}>
                    {lang === 'bn' ? 'মৌল ক' : 'Primary Element'}
                  </span>
                  
                  {/* Custom Searchable Dropdown A */}
                  <ElementDropdown
                    selectedElement={elemA}
                    onSelect={(el) => setElemAId(el.atomicNumber)}
                    accentColor={colorA}
                    lang={lang}
                  />
                </div>

                <div className="flex items-center gap-4 sm:gap-5">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white shadow-xl border shrink-0"
                    style={{ backgroundColor: `${colorA}20`, borderColor: `${colorA}60` }}
                  >
                    {elemA.symbol}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {lang === 'bn' ? elemA.bengaliName : elemA.name}
                    </h3>
                    <p className="text-[11px] text-white/60 uppercase font-bold tracking-wider">
                      {lang === 'bn' ? elemA.bengaliCategory : elemA.category} • {elemA.block.toUpperCase()}-Block
                    </p>
                    <p className="text-[10px] font-mono text-slate-300 mt-1">
                      {elemA.electronConfiguration}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <BohrAtom element={elemA} accentColor={colorA} size={180} interactive={false} />
                </div>
              </div>

              {/* Element B Card */}
              <div 
                className="p-5 sm:p-6 rounded-2xl border transition-all relative"
                style={{ backgroundColor: `${colorB}08`, borderColor: `${colorB}40` }}
              >
                <div className="flex items-center justify-between mb-4 gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest shrink-0" style={{ color: colorB }}>
                    {lang === 'bn' ? 'মৌল খ' : 'Secondary Element'}
                  </span>

                  {/* Custom Searchable Dropdown B */}
                  <ElementDropdown
                    selectedElement={elemB}
                    onSelect={(el) => setElemBId(el.atomicNumber)}
                    accentColor={colorB}
                    lang={lang}
                  />
                </div>

                <div className="flex items-center gap-4 sm:gap-5">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white shadow-xl border shrink-0"
                    style={{ backgroundColor: `${colorB}20`, borderColor: `${colorB}60` }}
                  >
                    {elemB.symbol}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {lang === 'bn' ? elemB.bengaliName : elemB.name}
                    </h3>
                    <p className="text-[11px] text-white/60 uppercase font-bold tracking-wider">
                      {lang === 'bn' ? elemB.bengaliCategory : elemB.category} • {elemB.block.toUpperCase()}-Block
                    </p>
                    <p className="text-[10px] font-mono text-slate-300 mt-1">
                      {elemB.electronConfiguration}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <BohrAtom element={elemB} accentColor={colorB} size={180} interactive={false} />
                </div>
              </div>
            </div>

            {/* Metrics Comparison Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                {lang === 'bn' ? 'ভৌত ও রাসায়নিক পরামিতির তুলনা' : 'Physical & Chemical Metrics'}
              </h4>

              <MetricRow
                label="Atomic Mass"
                bengaliLabel="পারমাণবিক ভর"
                valA={elemA.atomicMass}
                valB={elemB.atomicMass}
                unit="AMU"
                icon={Beaker}
              />

              <MetricRow
                label="Density"
                bengaliLabel="ঘনত্ব"
                valA={elemA.density}
                valB={elemB.density}
                unit="g/cm³"
                icon={Wind}
              />

              <MetricRow
                label="Melting Point"
                bengaliLabel="গলনাঙ্ক"
                valA={elemA.meltingPoint}
                valB={elemB.meltingPoint}
                unit="K"
                icon={Thermometer}
              />

              <MetricRow
                label="Boiling Point"
                bengaliLabel="স্ফুটনাঙ্ক"
                valA={elemA.boilingPoint}
                valB={elemB.boilingPoint}
                unit="K"
                icon={Thermometer}
              />

              <MetricRow
                label="Electronegativity"
                bengaliLabel="তড়িৎ-ঋণাত্মকতা"
                valA={elemA.electronegativity}
                valB={elemB.electronegativity}
                unit="Pauling"
                icon={Zap}
              />

              <MetricRow
                label="Ionization Energy"
                bengaliLabel="আয়নীয়করণ শক্তি"
                valA={elemA.ionizationEnergy}
                valB={elemB.ionizationEnergy}
                unit="kJ/mol"
                icon={Zap}
              />

              <MetricRow
                label="Atomic Radius"
                bengaliLabel="পারমাণবিক ব্যাসার্ধ"
                valA={elemA.atomicRadius}
                valB={elemB.atomicRadius}
                unit="pm"
                icon={Scale}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompareModal;
