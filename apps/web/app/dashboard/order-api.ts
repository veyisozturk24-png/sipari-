import { apiFetch } from "@/lib/api";
import { getActiveCompanyId } from "@/lib/auth";

import type {
  ApiOrder,
  CreateOrderDto,
  OrderStatus,
} from "./order-types";

export function fetchOrders(): Promise<ApiOrder[]> {
  const companyId = getActiveCompanyId();

  return apiFetch<ApiOrder[]>(
    `/orders?companyId=${companyId}`,
  );
}

export function createOrder(
  payload: CreateOrderDto,
): Promise<ApiOrder> {
  const companyId = getActiveCompanyId();

  return apiFetch<ApiOrder>(
    "/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        companyId,
      }),
    },
  );
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ApiOrder> {
  const companyId = getActiveCompanyId();

  return apiFetch<ApiOrder>(
    `/orders/${id}/status?companyId=${companyId}`,
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
  const companyId = getActiveCompanyId();

  return apiFetch<void>(
    `/orders/${id}?companyId=${companyId}`,
    {
      method: "DELETE",
    },
  );
}
