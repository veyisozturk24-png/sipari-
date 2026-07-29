import { OrderStatus } from "./order-types";

export function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "DRAFT":
      return "Taslak";

    case "PENDING":
      return "Onay bekliyor";

    case "CONFIRMED":
      return "Onaylandı";

    case "PREPARING":
      return "Hazırlanıyor";

    case "SHIPPED":
      return "Kargoda";

    case "DELIVERED":
      return "Teslim Edildi";

    case "CANCELLED":
      return "İptal edildi";

    case "RETURNED":
      return "İade edildi";

    default:
      return status;
  }
}

export function getNextOrderStatuses(status: OrderStatus) {
  const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    DRAFT: ["PENDING", "CANCELLED"],
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING", "CANCELLED"],
    PREPARING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "RETURNED"],
    DELIVERED: ["RETURNED"],
  };

  return [status, ...(transitions[status] ?? [])];
}
