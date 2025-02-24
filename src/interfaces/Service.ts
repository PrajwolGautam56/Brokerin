export interface IService {
  name: string;
  category: 'furniture' | 'interior' | 'painting' | 'cleaning' | 'plumbing' | 'electrical' | 'moving' | 'ac';
  description?: string;
  pricing: {
    type: 'fixed' | 'estimate' | 'range';
    amount?: number;
    minAmount?: number;
    maxAmount?: number;
    unit?: string;
  };
  features?: string[];
  images?: string[];
  isAvailable: boolean;
  estimateRequired: boolean;
} 