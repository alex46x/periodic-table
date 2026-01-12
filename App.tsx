
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, BarChart2, LayoutGrid, Maximize2, Zap, Thermometer, Wind } from 'lucide-react';
import { ELEMENTS, CATEGORY_COLORS } from './data';
import { ChemicalElement, ViewMode, PropertyKey } from './types';
import ElementCard from './components/ElementCard';
import DetailPanel from './components/DetailPanel';
import VisualizationPanel from './components/VisualizationPanel';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedProperty, setSelectedProperty] = useState<PropertyKey>('atomicMass');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<number | null>(null);
  const [showTools, setShowTools] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(ELEMENTS.map(e => e.category))).sort();
  }, []);

  const hoveredElement = useMemo(() => 
    hoveredElementId ? ELEMENTS.find(e => e.atomicNumber === hoveredElementId) : null
  , [hoveredElementId]);

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

  return (
    <div className="min-h-screen relative selection:bg-white/10">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] bg-blue-500/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] bg-purple-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-[60] glass-nav px-8 py-3 flex items-center justify-between border-b border-white/[0.05]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 group cursor-pointer">
          <Layers size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/60 group-hover:text-white transition-all">ElementX</span>
        </motion.div>

        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar px-4">
          <button onClick={() => setSelectedCategory(null)} className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all hover:text-white ${!selectedCategory ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-white/20'}`}>Spectrum</button>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            const categoryClass = getCategoryColorClass(cat);
            const groupColorText = getGroupColor(categoryClass);
            return (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`relative text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all flex flex-col items-center group ${isActive ? `${groupColorText} opacity-100` : 'text-white/25 hover:text-white/60'}`}>
                {cat}
                <div className={`absolute -bottom-2 h-[1px] transition-all duration-300 ${isActive ? `w-4 ${groupColorText.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]` : 'w-0'}`} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
            <button onClick={() => setShowTools(!showTools)} className={`p-2 transition-colors ${showTools ? 'text-cyan-400' : 'text-white/20 hover:text-white'}`}><Maximize2 size={14} /></button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-6 pt-32 pb-24 relative z-10 flex flex-col items-center">
        <AnimatePresence>
            {showTools && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex gap-2 p-1.5 mb-10 bg-white/[0.04] border border-white/10 rounded-full backdrop-blur-xl shadow-2xl">
                    {['table', 'heatmap', 'chart'].map(id => (
                        <button key={id} onClick={() => setViewMode(id as ViewMode)} className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${viewMode === id ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white/70'}`}>
                          {id}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {viewMode === 'table' || viewMode === 'heatmap' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative">
              <div 
                className="grid-container grid grid-cols-18 gap-1 md:gap-1.5 min-w-[1000px] relative pb-20" 
                style={{ display: 'grid', gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', gridTemplateRows: 'repeat(10, minmax(0, 1fr))' }}
              >
                {/* Floating Hover Preview */}
                <AnimatePresence>
                  {hoveredElement && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute z-[100] pointer-events-none"
                      style={{ 
                        gridColumn: '4 / 13', 
                        gridRow: '1 / 4',
                        padding: '1rem'
                      }}
                    >
                      <div className="h-full w-full glass rounded-2xl border border-white/10 p-6 flex items-center gap-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                          {hoveredElement.symbol}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">{hoveredElement.name}</h2>
                          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{hoveredElement.category}</p>
                          <div className="flex gap-4 pt-2">
                             <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                                <Zap size={10} className="text-yellow-400" /> {hoveredElement.electronConfiguration}
                             </div>
                             <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                                <Thermometer size={10} className="text-rose-400" /> {hoveredElement.meltingPoint} K
                             </div>
                             <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                                <Wind size={10} className="text-sky-400" /> {hoveredElement.density} g/cm³
                             </div>
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed pt-2 line-clamp-2 italic">
                            {hoveredElement.summary}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {ELEMENTS.map(element => {
                  const isHovered = hoveredElementId === element.atomicNumber;
                  const isInCategory = selectedCategory ? element.category === selectedCategory : true;
                  const isMuted = (hoveredElementId !== null && !isHovered) || (selectedCategory !== null && !isInCategory);
                  const isFocused = isHovered || (selectedCategory !== null && isInCategory && hoveredElementId === null);

                  return (
                    <ElementCard 
                      key={element.atomicNumber}
                      element={element} 
                      onClick={setSelectedElement}
                      onHover={setHoveredElementId}
                      isMuted={isMuted}
                      isFocused={isFocused}
                      categoryColorClass={getCategoryColorClass(element.category)}
                    />
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="viz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <VisualizationPanel property={selectedProperty} onPropertyChange={setSelectedProperty} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <DetailPanel element={selectedElement} onClose={() => setSelectedElement(null)} />

      <footer className="p-16 mt-24 flex flex-col items-center opacity-20">
        <Layers size={16} className="mb-4 text-cyan-400" />
        <span className="text-[8px] uppercase tracking-[0.8em] font-light text-white">ElementX Cinematic Protocol v4.0</span>
      </footer>
    </div>
  );
};

export default App;
