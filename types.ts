
export type ElementCategory = 
  | 'alkali metal' 
  | 'alkaline earth metal' 
  | 'transition metal' 
  | 'post-transition metal' 
  | 'metalloid' 
  | 'nonmetal' 
  | 'halogen' 
  | 'noble gas' 
  | 'lanthanide' 
  | 'actinide';

export type PhysicalState = 'solid' | 'liquid' | 'gas' | 'unknown';

export interface ChemicalElement {
  name: string;
  symbol: string;
  atomicNumber: number;
  atomicMass: number;
  category: ElementCategory;
  state: PhysicalState;
  density: number | null;
  meltingPoint: number | null;
  boilingPoint: number | null;
  electronegativity: number | null;
  atomicRadius: number | null;
  yearDiscovered: string | number;
  electronConfiguration: string;
  summary: string;
  cpkHex?: string;
  xpos: number;
  ypos: number;
}

export type ViewMode = 'table' | 'heatmap' | 'chart';

export type PropertyKey = 'atomicMass' | 'density' | 'meltingPoint' | 'electronegativity' | 'atomicRadius';
