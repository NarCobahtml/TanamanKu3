export type ScanClass =
  | 'Apple___Black_rot'
  | 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot'
  | 'Apple___healthy'
  | 'Corn_(maize)___healthy';

export interface Treatment {
  title: string;
  description: string;
}

export interface ProductRec {
  name: string;
  note: string;
}

export interface ClassContent {
  label: string;
  latin: string;
  pathogen: string | null;
  healthy: boolean;
  crop: 'Apel' | 'Jagung';
  headline: string;
  aiAnalysis: string;
  symptoms: string[];
  affectedParts: string;
  treatments: Treatment[];
  products: ProductRec[];
}

export type ScanResultContent = ClassContent;

export interface ScanData {
  class: string;
  confidence: number;
}
