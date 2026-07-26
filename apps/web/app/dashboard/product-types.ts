export interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string | null;
  emoji: string | null;
  price: number;
  stock: number;
  criticalStock: number | null;
  createdAt: string;
  updatedAt: string;
}