"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "./orders-table.module.css";

import OrderDrawer from "./order-drawer";
import OrderStatusBadge from "./order-status-badge";

import { fetchOrders } from "./order-api";

import type { ApiOrder } from "./order-types";

export default function OrdersTable() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedOrder, setSelectedOrder] =
    useState<ApiOrder | null>(null);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchOrders();

      setOrders(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        "Siparişler yüklenemedi.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0);

    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  useEffect(() => {
    const refreshOrders = () => void loadOrders();

    window.addEventListener("siparis:orders-changed", refreshOrders);

    return () =>
      window.removeEventListener("siparis:orders-changed", refreshOrders);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (order.customer?.name ?? "")
  .toLowerCase()
  .includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  function openOrder(
    order: ApiOrder,
  ) {
    setSelectedOrder(order);

    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);

    setSelectedOrder(null);
  }

  if (loading) {
    return (
      <p>Siparişler yükleniyor...</p>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <div className={styles.tableToolbar}>
        <label className={styles.searchField}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Sipariş veya müşteri ara"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>Durum</span>
          <select
            aria-label="Sipariş durumuna göre filtrele"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">Tüm durumlar</option>
            <option value="DRAFT">Taslak</option>
            <option value="PENDING">Onay bekliyor</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="PREPARING">Hazırlanıyor</option>
            <option value="SHIPPED">Kargoda</option>
            <option value="DELIVERED">Teslim edildi</option>
            <option value="CANCELLED">İptal edildi</option>
            <option value="RETURNED">İade edildi</option>
          </select>
        </label>

        <div className={styles.toolbarActions}>
          <span className={styles.countPill}>{filteredOrders.length} sipariş</span>
          <button type="button" className={styles.refreshButton} onClick={loadOrders}>
            ↻ Yenile
          </button>
        </div>
      </div>

      {filteredOrders.length ===
      0 ? (
        <p>
          Gösterilecek sipariş
          bulunamadı.
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Sipariş</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th aria-label="İşlem" />
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const customerName = order.customer?.name ?? order.shippingName ?? "Müşteri";
                const customerInitials = customerName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toLocaleUpperCase("tr-TR");

                return (
                  <tr key={order.id} className={styles.clickableRow} onClick={() => openOrder(order)}>
                    <td data-label="Sipariş">
                      <strong className={styles.orderNumber}>{order.orderNumber}</strong>
                      <span className={styles.orderMeta}>{order.items.length} ürün</span>
                    </td>
                    <td data-label="Müşteri">
                      <div className={styles.customerCell}>
                        <span className={styles.customerAvatar}>{customerInitials || "M"}</span>
                        <div>
                          <strong>{customerName}</strong>
                          <span>{order.customer?.phone ?? order.shippingPhone ?? "İletişim bilgisi yok"}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Tutar" className={styles.amount}>
                      {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.totalAmount)}
                    </td>
                    <td data-label="Durum"><OrderStatusBadge status={order.status} /></td>
                    <td data-label="Tarih" className={styles.dateCell}>
                      {new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                      <span>{new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className={styles.actionCell}>
                      <button type="button" onClick={(event) => { event.stopPropagation(); openOrder(order); }}>
                        İncele <span>→</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <OrderDrawer
        key={selectedOrder?.id ?? "empty"}
        open={drawerOpen}
        order={selectedOrder}
        onClose={closeDrawer}
        onUpdated={(updatedOrder) => {
          setOrders((currentOrders) =>
            currentOrders.map((currentOrder) =>
              currentOrder.id === updatedOrder.id
                ? updatedOrder
                : currentOrder,
            ),
          );
          closeDrawer();
        }}
      />
    </>
  );
}
