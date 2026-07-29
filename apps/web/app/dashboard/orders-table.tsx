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
      <div
        className={
          styles.tableToolbar
        }
      >
        <input
          type="text"
          placeholder="Sipariş veya müşteri ara..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value,
            )
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value,
            )
          }
        >
          <option value="ALL">
            Tüm Durumlar
          </option>

          <option value="DRAFT">
            Taslak
          </option>

          <option value="PREPARING">
            Hazırlanıyor
          </option>

          <option value="SHIPPED">
            Kargoda
          </option>

          <option value="DELIVERED">
            Teslim Edildi
          </option>

          <option value="COMPLETED">
            Tamamlandı
          </option>
        </select>

        <button
          onClick={loadOrders}
        >
          Yenile
        </button>

        <span>
          {
            filteredOrders.length
          }{" "}
          sipariş
        </span>
      </div>

      {filteredOrders.length ===
      0 ? (
        <p>
          Gösterilecek sipariş
          bulunamadı.
        </p>
      ) : (
        <table
          className={
            styles.ordersTable
          }
        >
          <thead>
            <tr>
              <th>
                Sipariş No
              </th>

              <th>
                Müşteri
              </th>

              <th>Tutar</th>

              <th>
                Durum
              </th>

              <th>
                Tarih
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map(
              (order) => (
                <tr
                  key={order.id}
                  className={
                    styles.clickableRow
                  }
                  onClick={() =>
                    openOrder(
                      order,
                    )
                  }
                >
                  <td>
                    {
                      order.orderNumber
                    }
                  </td>

                  <td>{order.customer?.name ?? "-"}</td>

                  <td>
                    {new Intl.NumberFormat(
                      "tr-TR",
                      {
                        style:
                          "currency",
                        currency:
                          "TRY",
                      },
                    ).format(
                      order.totalAmount,
                    )}
                  </td>

                  <td>
                    <OrderStatusBadge
                      status={
                        order.status
                      }
                    />
                  </td>

                  <td>
                    {new Date(
                      order.createdAt,
                    ).toLocaleString(
                      "tr-TR",
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
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
