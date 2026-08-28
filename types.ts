
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

export type ElementBlock = 's' | 'p' | 'd' | 'f';

export type PhysicalState = 'solid' | 'liquid' | 'gas' | 'unknown';

export type Language = 'en' | 'bn';

export interface ChemicalElement {
  name: string;
  symbol: string;
  atomicNumber: number;
  atomicMass: number;
  category: ElementCategory;
  state: PhysicalState;
  block: ElementBlock;
  density: number | null;
  meltingPoint: number | null;
  boilingPoint: number | null;
  electronegativity: number | null;
  atomicRadius: number | null;
  ionizationEnergy: number | null; // in kJ/mol
  oxidationStates: string; // e.g. "+1, +2, -1"
  shells: number[]; // e.g. [2, 8, 1] for Bohr model
  yearDiscovered: string | number;
  discoveredBy: string;
  electronConfiguration: string;
  summary: string;
  bengaliName: string;
  bengaliCategory: string;
  bengaliSummary: string;
  funFact: string;
  cpkHex?: string;
  xpos: number;
  ypos: number;
}

export type ViewMode = 'table' | 'heatmap' | 'chart' | 'list';

export type PropertyKey = 
  | 'atomicMass' 
  | 'density' 
  | 'meltingPoint' 
  | 'boilingPoint' 
  | 'electronegativity' 
  | 'atomicRadius' 
  | 'ionizationEnergy';
