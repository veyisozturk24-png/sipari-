import styles from "./dashboard.module.css";
import { OrderStatus } from "./order-types";
import { getStatusLabel } from "./order-utils";

interface Props {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: Props) {
  const className = (() => {
    switch (status) {
      case "DRAFT":
        return styles.statusNew;

      case "PREPARING":
        return styles.statusPreparing;

      case "SHIPPED":
        return styles.statusShipping;

      case "DELIVERED":
        return styles.statusDelivered;

      case "COMPLETED":
        return styles.statusCompleted;

      default:
        return styles.statusNew;
    }
  })();

  return (
    <span className={`${styles.statusBadge} ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
}