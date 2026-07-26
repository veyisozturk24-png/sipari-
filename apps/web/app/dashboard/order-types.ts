export const ORDER_STATUSES = [
  "DRAFT",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus =
  (typeof ORDER_STATUSES)[number];

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface OrderItem {
  id: string;

  productId: string;
  productName: string;
  sku: string | null;

  quantity: number;

  unitPrice: number;
  totalPrice: number;
}

export interface Shipment {
  id: string;

  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;

  status: string;

  createdAt: string;
  updatedAt: string;
}

export interface ApiOrder {
  id: string;

  companyId: string;
  customerId: string | null;

  orderNumber: string;

  status: OrderStatus;

  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;

  customerNote: string | null;
  internalNote: string | null;

  shippingName: string | null;
  shippingPhone: string | null;
  shippingCity: string | null;
  shippingDistrict: string | null;
  shippingAddress: string | null;

  customer: CustomerSummary | null;
  items: OrderItem[];
  shipment: Shipment | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  companyId?: string;

  customerId?: string;

  items: CreateOrderItemDto[];

  shippingAmount?: number;
  discountAmount?: number;

  customerNote?: string;
  internalNote?: string;

  shippingName?: string;
  shippingPhone?: string;
  shippingCity?: string;
  shippingDistrict?: string;
  shippingAddress?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}