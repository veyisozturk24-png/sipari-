export type ApiProductStatus = 'ACTIVE' | 'PASSIVE';

export type ApiProduct = {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  criticalStock: number;
  emoji: string;
  price: string;
  stock: number;
  status: ApiProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateApiProductInput = {
  companyId: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  criticalStock?: number;
  emoji?: string;
  price: number;
  stock: number;
};

export type UpdateApiProductInput = {
  name?: string;
  sku?: string;
  description?: string;
  category?: string;
  criticalStock?: number;
  emoji?: string;
  price?: number;
  stock?: number;
};
