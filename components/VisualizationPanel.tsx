
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChemicalElement, PropertyKey } from '../types';
import { ELEMENTS } from '../data';

interface VisualizationPanelProps {
  property: PropertyKey;
  onPropertyChange: (prop: PropertyKey) => void;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ property, onPropertyChange }) => {
  const chartData = ELEMENTS
    .filter(e => e[property] !== null)
    .sort((a, b) => a.atomicNumber - b.atomicNumber)
    .map(e => ({
      name: e.symbol,
      value: e[property],
      fullName: e.name
    }));

  const properties: { key: PropertyKey; label: string }[] = [
    { key: 'atomicMass', label: 'Atomic Mass' },
    { key: 'density', label: 'Density' },
    { key: 'meltingPoint', label: 'Melting Point' },
    { key: 'electronegativity', label: 'Electronegativity' },
    { key: 'atomicRadius', label: 'Atomic Radius' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-cyan-400 font-bold">{payload[0].payload.fullName} ({payload[0].payload.name})</p>
          <p className="text-white">{property}: <span className="font-mono">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-wrap gap-2 justify-center">
        {properties.map((p) => (
          <button
            key={p.key}
            onClick={() => onPropertyChange(p.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
              property === p.key 
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="h-[300px] md:h-[400px] w-full glass rounded-2xl p-6 border border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
            />
            <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#barGradient)`}
                  className="transition-all duration-500"
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.4} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisualizationPanel;
