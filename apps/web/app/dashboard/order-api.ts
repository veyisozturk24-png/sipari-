import { apiFetch } from "@/lib/api";

import type {
  ApiOrder,
  CreateOrderDto,
  OrderStatus,
} from "./order-types";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID!;

export function fetchOrders(): Promise<ApiOrder[]> {
  return apiFetch<ApiOrder[]>(
    `/orders?companyId=${COMPANY_ID}`,
  );
}

export function createOrder(
  payload: CreateOrderDto,
): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(
    "/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        companyId: COMPANY_ID,
      }),
    },
  );
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(
    `/orders/${id}/status?companyId=${COMPANY_ID}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    },
  );
}

export function deleteOrder(
  id: string,
): Promise<void> {
  return apiFetch<void>(
    `/orders/${id}?companyId=${COMPANY_ID}`,
    {
      method: "DELETE",
    },
  );
}