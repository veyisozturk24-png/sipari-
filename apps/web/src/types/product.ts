export type ProductStatus = 'ACTIVE' | 'PASSIVE';

export type Product = {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  stock: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  companyId: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
};
