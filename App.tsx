import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  BarChart2, 
  LayoutGrid, 
  List,
  Zap, 
  Thermometer, 
  Wind, 
  Search, 
  X, 
  Scale, 
  Award, 
  Globe, 
  Sparkles, 
  Flame, 
  Sliders,
  Beaker,
  Snowflake,
  Droplets,
  ChevronRight,
  MoveHorizontal
} from 'lucide-react';
import { ELEMENTS, CATEGORY_COLORS, CATEGORY_NAMES_BN, BLOCK_COLORS } from './data';
import { ChemicalElement, ViewMode, PropertyKey, Language, ElementBlock } from './types';
import ElementCard from './components/ElementCard';
import DetailPanel from './components/DetailPanel';
import VisualizationPanel from './components/VisualizationPanel';
import CompareModal from './components/CompareModal';
import QuizModal from './components/QuizModal';

const App: React.FC = () => {
  // Navigation & Core States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ElementBlock | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedProperty, setSelectedProperty] = useState<PropertyKey>('electronegativity');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<number | null>(null);
  
  // Search State & Mobile Search Toggle
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Language State (Bilingual: English / Bengali)
  const [lang, setLang] = useState<Language>('en');

  // Temperature Simulation State (in Kelvin)
  const [showTempSlider, setShowTempSlider] = useState<boolean>(false);
  const [temperatureK, setTemperatureK] = useState<number>(293.15); // Default room temp 20°C

  // Modals
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareElemA, setCompareElemA] = useState<ChemicalElement | null>(null);
  const [compareElemB, setCompareElemB] = useState<ChemicalElement | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);

  // Keyboard shortcut listener ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowMobileSearch(true);
      } else if (e.key === 'Escape') {
        if (selectedElement) setSelectedElement(null);
        if (isCompareOpen) setIsCompareOpen(false);
        if (isQuizOpen) setIsQuizOpen(false);
        setShowMobileSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, isCompareOpen, isQuizOpen]);

  const categories = useMemo(() => {
    return Array.from(new Set(ELEMENTS.map(e => e.category))).sort();
  }, []);

  // Filter Elements based on search query
  const matchingElementIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    const matches = ELEMENTS.filter(e => {
      const matchName = e.name.toLowerCase().includes(q);
      const matchSymbol = e.symbol.toLowerCase() === q || e.symbol.toLowerCase().startsWith(q);
      const matchNum = e.atomicNumber.toString() === q;
      const matchBnName = e.bengaliName.toLowerCase().includes(q);
      const matchCat = e.category.toLowerCase().includes(q) || e.bengaliCategory.toLowerCase().includes(q);
      return matchName || matchSymbol || matchNum || matchBnName || matchCat;
    });
    return new Set(matches.map(e => e.atomicNumber));
  }, [searchQuery]);

  // Filtered elements list (for List View)
  const filteredElementsList = useMemo(() => {
    return ELEMENTS.filter(element => {
      const matchesSearch = matchingElementIds ? matchingElementIds.has(element.atomicNumber) : true;
      const isInCategory = selectedCategory ? element.category === selectedCategory : true;
      const isInBlock = selectedBlock ? element.block === selectedBlock : true;
      return matchesSearch && isInCategory && isInBlock;
    });
  }, [matchingElementIds, selectedCategory, selectedBlock]);

  const hoveredElement = useMemo(() => 
    hoveredElementId ? ELEMENTS.find(e => e.atomicNumber === hoveredElementId) : null
  , [hoveredElementId]);

  // Calculate Min & Max for active heatmap property
  const propertyExtremes = useMemo(() => {
    const validValues = ELEMENTS
      .map(e => e[selectedProperty])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));

    if (validValues.length === 0) return { min: 0, max: 1 };
    return {
      min: Math.min(...validValues),
      max: Math.max(...validValues)
    };
  }, [selectedProperty]);

  // Calculate dynamic state counts for current temperature
  const stateCounts = useMemo(() => {
    if (!showTempSlider) return null;
    let solid = 0;
    let liquid = 0;
    let gas = 0;
    let unknown = 0;

    ELEMENTS.forEach(e => {
      const mp = e.meltingPoint ?? -Infinity;
      const bp = e.boilingPoint ?? Infinity;

      if (e.meltingPoint === null && e.boilingPoint === null) unknown++;
      else if (temperatureK < mp) solid++;
      else if (temperatureK >= mp && temperatureK < bp) liquid++;
      else if (temperatureK >= bp) gas++;
      else unknown++;
    });

    return { solid, liquid, gas, unknown };
  }, [showTempSlider, temperatureK]);

  const getCategoryColorClass = (cat: string) => {
    return CATEGORY_COLORS[cat] || 'from-slate-500/20 to-slate-400/20';
  };

  const getGroupColor = (category: string) => {
    if (category.includes('sky')) return 'text-sky-400';
    if (category.includes('violet')) return 'text-violet-400';
    if (category.includes('red')) return 'text-red-500';
    if (category.includes('orange')) return 'text-orange-400';
    if (category.includes('cyan')) return 'text-cyan-400';
    if (category.includes('emerald')) return 'text-emerald-400';
    if (category.includes('green')) return 'text-green-400';
    if (category.includes('yellow')) return 'text-yellow-400';
    if (category.includes('pink')) return 'text-pink-400';
    if (category.includes('rose')) return 'text-rose-400';
    return 'text-white';
  };

  const handleOpenCompare = (elem: ChemicalElement) => {
    setCompareElemA(elem);
    setCompareElemB(ELEMENTS.find(e => e.atomicNumber !== elem.atomicNumber) || ELEMENTS[0]);
    setIsCompareOpen(true);
  };

  const temperatureCelsius = (temperatureK - 273.15).toFixed(1);

  return (
    <div className="min-h-screen relative selection:bg-cyan-500/20 text-slate-100 pb-20">
      {/* Background Animated Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[35%] h-[35%] bg-cyan-500/5 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[35%] h-[35%] bg-purple-500/5 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/2 w-[25%] h-[25%] bg-pink-500/5 blur-[140px] rounded-full" />
      </div>

      {/* Main Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[60] glass-nav px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-white/[0.08] gap-3 backdrop-blur-xl">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2.5 group cursor-pointer shrink-0" 
          onClick={() => { setSelectedCategory(null); setSelectedBlock(null); setSearchQuery(''); }}
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all">
            <Layers size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              ElementX
              <span className="text-[7px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-cyan-300">PWA</span>
            </span>
            <span className="text-[7px] text-white/40 tracking-widest uppercase font-mono hidden sm:inline">
              {lang === 'bn' ? 'পর্যায় সারণী' : 'Periodic Spectrum'}
            </span>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? "মৌল খুঁজুন (উদা: Gold, সোনা, Au, 79)... [/]" : "Search elements (e.g. Gold, Au, 79)... [/]"}
              className="w-full bg-black/40 border border-white/10 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-white p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Icon Button */}
          <button
            onClick={() => {
              setShowMobileSearch(!showMobileSearch);
              if (!showMobileSearch) setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
            }}
            className={`p-2 rounded-full md:hidden border transition-all ${
              showMobileSearch || searchQuery
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Search"
          >
            <Search size={14} />
          </button>

          {/* Temperature Slider Toggle */}
          <button
            onClick={() => setShowTempSlider(!showTempSlider)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border ${
              showTempSlider
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
            title={lang === 'bn' ? 'তাপমাত্রা স্লাইডার' : 'Temperature State Simulator'}
          >
            <Thermometer size={14} />
            <span className="hidden lg:inline">{lang === 'bn' ? 'তাপমাত্রা' : 'State at T'}</span>
          </button>

          {/* Compare Modal Button */}
          <button
            onClick={() => {
              setCompareElemA(selectedElement || ELEMENTS[0]);
              setCompareElemB(ELEMENTS[78]);
              setIsCompareOpen(true);
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            title={lang === 'bn' ? 'মৌল তুলনা' : 'Compare 2 Elements'}
          >
            <Scale size={14} className="text-cyan-400" />
            <span className="hidden lg:inline">{lang === 'bn' ? 'তুলনা' : 'Compare'}</span>
          </button>

          {/* Quiz Button */}
          <button
            onClick={() => setIsQuizOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            title={lang === 'bn' ? 'ক্যামিস্ট্রি কুইজ' : 'Chemistry Quiz Challenge'}
          >
            <Award size={14} />
            <span className="hidden lg:inline">{lang === 'bn' ? 'কুইজ' : 'Quiz'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-cyan-300 hover:bg-white/20 transition-all flex items-center gap-1"
            title={lang === 'en' ? 'বাংলা ভাষায় দেখুন' : 'Switch to English'}
          >
            <Globe size={13} />
            <span>{lang === 'en' ? 'বাং' : 'EN'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Expandable Search Bar */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-50 p-3 bg-black/90 border-b border-white/10 md:hidden backdrop-blur-xl"
          >
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-slate-400" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? "মৌল খুঁজুন (Gold, সোনা, Au, 79)..." : "Search elements (Gold, Au, 79)..."}
                className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Header: Mode Switcher & Category Spectrum */}
      <div className="pt-16 sm:pt-20 px-3 sm:px-6 md:px-8 max-w-[1500px] mx-auto flex flex-col items-center gap-3.5 relative z-20">
        {/* View Mode Pills (Table, Heatmap, Chart, List) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-full backdrop-blur-xl shadow-xl">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              viewMode === 'table' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={12} />
            {lang === 'bn' ? 'পর্যায় সারণী' : 'Table'}
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={12} />
            {lang === 'bn' ? 'লিস্ট ভিউ' : 'List'}
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              viewMode === 'heatmap' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap size={12} />
            {lang === 'bn' ? 'হিটম্যাপ' : 'Heatmap'}
          </button>

          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              viewMode === 'chart' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 size={12} />
            {lang === 'bn' ? 'চার্ট' : 'Chart'}
          </button>
        </div>

        {/* Categories Spectrum Bar */}
        <div className="w-full flex items-center justify-start md:justify-center gap-3 md:gap-4 overflow-x-auto no-scrollbar py-1 px-1">
          <button 
            onClick={() => { setSelectedCategory(null); setSelectedBlock(null); }} 
            className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap px-2 py-1 rounded-md ${
              !selectedCategory && !selectedBlock ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-white/40 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'সব মৌল' : 'Spectrum'}
          </button>

          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            const categoryClass = getCategoryColorClass(cat);
            const groupColorText = getGroupColor(categoryClass);
            const label = lang === 'bn' ? (CATEGORY_NAMES_BN[cat] || cat) : cat;
            return (
              <button 
                key={cat} 
                onClick={() => {
                  setSelectedCategory(isActive ? null : cat);
                  setSelectedBlock(null);
                }} 
                className={`relative text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-all flex flex-col items-center group py-1 px-1.5 ${
                  isActive ? `${groupColorText} opacity-100 font-black` : 'text-white/30 hover:text-white/70'
                }`}
              >
                {label}
                <div className={`absolute -bottom-1 h-[2px] transition-all duration-300 rounded-full ${
                  isActive ? `w-full ${groupColorText.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]` : 'w-0'
                }`} />
              </button>
            );
          })}
        </div>

        {/* Block Filters (s, p, d, f) */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold">
          <span className="text-slate-500 uppercase tracking-widest">{lang === 'bn' ? 'ব্লক:' : 'Blocks:'}</span>
          {(['s', 'p', 'd', 'f'] as ElementBlock[]).map(blk => {
            const isSelected = selectedBlock === blk;
            const blockInfo = BLOCK_COLORS[blk];
            return (
              <button
                key={blk}
                onClick={() => {
                  setSelectedBlock(isSelected ? null : blk);
                  setSelectedCategory(null);
                }}
                className={`px-2.5 py-0.5 rounded-md uppercase transition-all border ${
                  isSelected
                    ? `${blockInfo.bg} ${blockInfo.border} ${blockInfo.text} shadow-[0_0_10px_currentColor]`
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {blk}-Block
              </button>
            );
          })}
        </div>

        {/* Temperature Simulator Control Panel (when active) */}
        <AnimatePresence>
          {showTempSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="w-full max-w-3xl glass p-4 md:p-6 rounded-3xl border border-amber-500/30 shadow-2xl space-y-4 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Thermometer size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {lang === 'bn' ? 'তাপমাত্রা ও পদার্থের অবস্থা' : 'State of Matter Simulation'}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {temperatureK.toFixed(0)} K ({temperatureCelsius} °C)
                    </p>
                  </div>
                </div>

                {/* State Counters */}
                {stateCounts && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono font-bold">
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      <Snowflake size={11} /> {lang === 'bn' ? 'কঠিন:' : 'Solid:'} {stateCounts.solid}
                    </span>
                    <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20">
                      <Droplets size={11} /> {lang === 'bn' ? 'তরল:' : 'Liquid:'} {stateCounts.liquid}
                    </span>
                    <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                      <Wind size={11} /> {lang === 'bn' ? 'গ্যাস:' : 'Gas:'} {stateCounts.gas}
                    </span>
                  </div>
                )}
              </div>

              {/* Slider Track */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="10"
                  value={temperatureK}
                  onChange={(e) => setTemperatureK(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                
                {/* Temperature Presets */}
                <div className="flex flex-wrap justify-between gap-1 text-[9px] font-mono text-slate-400">
                  <button onClick={() => setTemperatureK(0)} className="hover:text-amber-300">0K (Abs Zero)</button>
                  <button onClick={() => setTemperatureK(293.15)} className="hover:text-amber-300 font-bold text-amber-400">293K (Room 20°C)</button>
                  <button onClick={() => setTemperatureK(373.15)} className="hover:text-amber-300">373K (Water Boil)</button>
                  <button onClick={() => setTemperatureK(1337)} className="hover:text-amber-300">1337K (Gold Melt)</button>
                  <button onClick={() => setTemperatureK(3695)} className="hover:text-amber-300">3695K (Tungsten)</button>
                  <button onClick={() => setTemperatureK(5778)} className="hover:text-amber-300">5778K (Sun Surface)</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heatmap Property Selector & Legend (when viewMode === 'heatmap') */}
        <AnimatePresence>
          {viewMode === 'heatmap' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-4xl glass p-4 rounded-3xl border border-purple-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-300 tracking-wider">
                  {lang === 'bn' ? 'হিটম্যাপ প্রোপার্টি:' : 'Heatmap Metric:'}
                </span>
                {[
                  { key: 'electronegativity', label: 'Electronegativity', bn: 'তড়িৎ-ঋণাত্মকতা' },
                  { key: 'atomicRadius', label: 'Atomic Radius', bn: 'ব্যাসার্ধ' },
                  { key: 'ionizationEnergy', label: 'Ionization Energy', bn: 'আয়নীয়করণ শক্তি' },
                  { key: 'density', label: 'Density', bn: 'ঘনত্ব' },
                  { key: 'meltingPoint', label: 'Melting Point', bn: 'গলনাঙ্ক' },
                  { key: 'atomicMass', label: 'Atomic Mass', bn: 'ভর' },
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedProperty(p.key as PropertyKey)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                      selectedProperty === p.key
                        ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'bn' ? p.bn : p.label}
                  </button>
                ))}
              </div>

              {/* Heatmap Gradient Legend */}
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                <span>{propertyExtremes.min} (Min)</span>
                <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-rose-500 shadow-inner" />
                <span>{propertyExtremes.max} (Max)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto p-2 sm:p-4 md:p-6 pt-6 relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {viewMode === 'table' || viewMode === 'heatmap' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative">
              {/* Mobile Scroll Hint */}
              <div className="md:hidden flex items-center justify-center gap-1.5 text-[9px] text-cyan-400/70 font-mono mb-2">
                <MoveHorizontal size={12} className="animate-pulse" />
                <span>{lang === 'bn' ? '১৮-কলাম দেখতে ডানে-বামে সোয়াইপ করুন' : 'Swipe left/right to view 18 columns'}</span>
              </div>

              <div className="w-full overflow-x-auto no-scrollbar pb-10">
                <div 
                  className="grid-container grid grid-cols-18 gap-1 md:gap-1.5 min-w-[1020px] relative pb-10" 
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', gridTemplateRows: 'repeat(10, minmax(0, 1fr))' }}
                >
                  {/* Floating Center Hover Preview Card (Desktop) */}
                  <AnimatePresence>
                    {hoveredElement && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 10 }}
                        className="absolute z-[40] pointer-events-none hidden md:block"
                        style={{ 
                          gridColumn: '3 / 13', 
                          gridRow: '1 / 4',
                          padding: '0.5rem'
                        }}
                      >
                        <div className="h-full w-full glass rounded-3xl border border-white/15 p-5 md:p-6 flex items-center gap-6 shadow-[0_0_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
                          <div className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                            {hoveredElement.symbol}
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-baseline gap-3">
                              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                                {lang === 'bn' ? hoveredElement.bengaliName : hoveredElement.name}
                              </h2>
                              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                                #{hoveredElement.atomicNumber} • {hoveredElement.block.toUpperCase()}-Block
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {lang === 'bn' ? hoveredElement.bengaliCategory : hoveredElement.category}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-1 text-[10px] font-mono text-slate-300">
                               <div className="flex items-center gap-1.5">
                                  <Zap size={12} className="text-yellow-400" /> {hoveredElement.electronConfiguration}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Thermometer size={12} className="text-rose-400" /> {hoveredElement.meltingPoint ?? '—'} K
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Wind size={12} className="text-sky-400" /> {hoveredElement.density ?? '—'} g/cm³
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Beaker size={12} className="text-emerald-400" /> {hoveredElement.atomicMass} AMU
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed pt-1 line-clamp-2 italic">
                              {lang === 'bn' ? hoveredElement.bengaliSummary : hoveredElement.summary}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Render 118 Element Cards */}
                  {ELEMENTS.map(element => {
                    const isHovered = hoveredElementId === element.atomicNumber;
                    const matchesSearch = matchingElementIds ? matchingElementIds.has(element.atomicNumber) : true;
                    const isInCategory = selectedCategory ? element.category === selectedCategory : true;
                    const isInBlock = selectedBlock ? element.block === selectedBlock : true;

                    const isFiltered = matchesSearch && isInCategory && isInBlock;
                    const isMuted = !isFiltered || (hoveredElementId !== null && !isHovered);
                    const isFocused = isHovered || (isFiltered && (selectedCategory !== null || selectedBlock !== null || matchingElementIds !== null) && hoveredElementId === null);

                    // Calculate ratio for heatmap mode
                    let heatmapRatio: number | null = null;
                    if (viewMode === 'heatmap') {
                      const val = element[selectedProperty];
                      if (typeof val === 'number' && !isNaN(val)) {
                        const range = propertyExtremes.max - propertyExtremes.min || 1;
                        heatmapRatio = Math.max(0, Math.min(1, (val - propertyExtremes.min) / range));
                      }
                    }

                    return (
                      <ElementCard 
                        key={element.atomicNumber}
                        element={element} 
                        onClick={setSelectedElement}
                        onHover={setHoveredElementId}
                        isMuted={isMuted}
                        isFocused={isFocused}
                        categoryColorClass={getCategoryColorClass(element.category)}
                        lang={lang}
                        temperatureK={showTempSlider ? temperatureK : null}
                        heatmapRatio={heatmapRatio}
                        heatmapProperty={viewMode === 'heatmap' ? selectedProperty : null}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : viewMode === 'list' ? (
            /* Mobile & Desktop List/Card View */
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-5xl">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {lang === 'bn' ? `মোট মৌল: ${filteredElementsList.length}টি` : `Showing ${filteredElementsList.length} elements`}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {lang === 'bn' ? 'যেকোনো মৌলে ট্যাপ করে বিস্তারিত দেখুন' : 'Tap any element for full details'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredElementsList.map(element => {
                  const categoryClass = getCategoryColorClass(element.category);
                  const groupColor = getGroupColor(categoryClass);

                  return (
                    <motion.div
                      key={element.atomicNumber}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedElement(element)}
                      className="p-4 rounded-2xl glass border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg border"
                          style={{ backgroundColor: `${groupColor}15`, borderColor: `${groupColor}40` }}
                        >
                          {element.symbol}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                              {lang === 'bn' ? element.bengaliName : element.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              #{element.atomicNumber}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {lang === 'bn' ? element.bengaliCategory : element.category} • {element.block.toUpperCase()}-Block
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {element.atomicMass} AMU • {element.electronConfiguration}
                          </p>
                        </div>
                      </div>

                      <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1 shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="viz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <VisualizationPanel 
                property={selectedProperty} 
                onPropertyChange={setSelectedProperty}
                onSelectElement={setSelectedElement}
                lang={lang}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Side Slide-Over Detail Panel */}
      <DetailPanel 
        element={selectedElement} 
        onClose={() => setSelectedElement(null)}
        onOpenCompare={handleOpenCompare}
        lang={lang}
      />

      {/* Element Comparison Modal */}
      <CompareModal
        initialElementA={compareElemA}
        initialElementB={compareElemB}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        lang={lang}
      />

      {/* Chemistry Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="p-10 mt-12 flex flex-col items-center opacity-40 hover:opacity-80 transition-opacity">
        <Layers size={18} className="mb-2 text-cyan-400 animate-pulse" />
        <span className="text-[9px] uppercase tracking-[0.5em] font-light text-white text-center">
          ElementX Quantum Periodic Engine • Mobile & PWA Ready
        </span>
        <span className="text-[8px] font-mono text-slate-500 mt-1">
          Bilingual Chemistry Suite (English / বাংলা)
        </span>
      </footer>
    </div>
  );
};

export default App;
