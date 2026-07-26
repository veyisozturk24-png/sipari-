import { OrderStatus } from "./order-types";

export function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "DRAFT":
      return "Yeni";

    case "PREPARING":
      return "Hazırlanıyor";

    case "SHIPPED":
      return "Kargoda";

    case "DELIVERED":
      return "Teslim Edildi";

    case "COMPLETED":
      return "Tamamlandı";

    default:
      return status;
  }
}