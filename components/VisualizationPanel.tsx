import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChemicalElement, Language, PropertyKey } from '../types';
import { ELEMENTS } from '../data';

interface VisualizationPanelProps {
  property: PropertyKey;
  onPropertyChange: (prop: PropertyKey) => void;
  onSelectElement?: (element: ChemicalElement) => void;
  lang?: Language;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ 
  property, 
  onPropertyChange,
  onSelectElement,
  lang = 'en'
}) => {
  const chartData = ELEMENTS
    .filter(e => e[property] !== null && e[property] !== undefined)
    .sort((a, b) => a.atomicNumber - b.atomicNumber)
    .map(e => ({
      name: e.symbol,
      value: e[property],
      fullName: lang === 'bn' ? e.bengaliName : e.name,
      atomicNumber: e.atomicNumber,
      element: e
    }));

  const properties: { key: PropertyKey; label: string; bnLabel: string }[] = [
    { key: 'atomicMass', label: 'Atomic Mass', bnLabel: 'পারমাণবিক ভর' },
    { key: 'density', label: 'Density', bnLabel: 'ঘনত্ব' },
    { key: 'meltingPoint', label: 'Melting Point', bnLabel: 'গলনাঙ্ক' },
    { key: 'boilingPoint', label: 'Boiling Point', bnLabel: 'স্ফুটনাঙ্ক' },
    { key: 'electronegativity', label: 'Electronegativity', bnLabel: 'তড়িৎ-ঋণাত্মকতা' },
    { key: 'ionizationEnergy', label: 'Ionization Energy', bnLabel: 'আয়নীয়করণ শক্তি' },
    { key: 'atomicRadius', label: 'Atomic Radius', bnLabel: 'পারমাণবিক ব্যাসার্ধ' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <p className="text-cyan-400 font-bold text-xs">{data.fullName} ({data.name}) - #{data.atomicNumber}</p>
          <p className="text-white text-xs mt-1">
            {properties.find(p => p.key === property)?.[lang === 'bn' ? 'bnLabel' : 'label']}:{' '}
            <span className="font-mono font-bold text-amber-400">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Property Selector Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {properties.map((p) => (
          <button
            key={p.key}
            onClick={() => onPropertyChange(p.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
              property === p.key 
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.35)]' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {lang === 'bn' ? p.bnLabel : p.label}
          </button>
        ))}
      </div>

      {/* Chart Box */}
      <div className="h-[340px] md:h-[440px] w-full glass rounded-3xl p-6 border border-white/10 shadow-2xl relative">
        <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-2">
          {lang === 'bn' ? 'মৌলসমূহের মানচিত্র (১-১১৮)' : 'Comparative Spectrum (Elements 1-118)'}
        </p>

        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              interval={window.innerWidth < 768 ? 4 : 1}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              onClick={(data: any) => onSelectElement && data?.element && onSelectElement(data.element)}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#barGradient)`}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisualizationPanel;
