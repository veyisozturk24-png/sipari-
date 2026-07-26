"use client";

import { useEffect, useState } from "react";

import styles from "./order-drawer.module.css";
import OrderStatusBadge from "./order-status-badge";

import { updateOrderStatus } from "./order-api";

import type { ApiOrder, OrderStatus } from "./order-types";

type Props = {
  open: boolean;
  order: ApiOrder | null;
  onClose: () => void;
};

export default function OrderDrawer({
  open,
  order,
  onClose,
}: Props) {
  const [status, setStatus] = useState<OrderStatus>("DRAFT");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
  }, [onClose]);

  async function handleSave() {
    if (!order) return;

    try {
      setSaving(true);

      await updateOrderStatus(
        order.id,
        status,
      );

      alert("Sipariş güncellendi.");

      onClose();
    } catch (err) {
      console.error(err);

      alert("Sipariş güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (!order) return null;

  return (
    <>
      <div
        className={`${styles.overlay} ${
          open ? styles.visible : ""
        }`}
        onClick={onClose}
      />

      <aside
        className={`${styles.drawer} ${
          open ? styles.open : ""
        }`}
      >
        <header className={styles.header}>
          <div>
            <small>Sipariş</small>

            <h2>{order.orderNumber}</h2>
          </div>

          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <section className={styles.section}>
          <h3>Müşteri</h3>

          <div className={styles.customerCard}>
            <div className={styles.avatar}>
              {order.customer.name
                .split(" ")
                .map((x) => x[0])
                .join("")
                .substring(0, 2)}
            </div>

            <div>
              <strong>{order.customer.name}</strong>

              <p>{order.customer.phone}</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3>Durum</h3>

          <OrderStatusBadge status={status} />

          <select
            className={styles.statusSelect}
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as OrderStatus,
              )
            }
          >
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
        </section>

        <section className={styles.section}>
          <h3>Ürünler</h3>

          {order.items.length === 0 ? (
            <p>Ürün bulunamadı.</p>
          ) : (
            order.items.map((item) => (
              <div
                key={item.id}
                className={styles.summaryRow}
              >
                <span>
                  {item.quantity} ×{" "}
                  {item.productName}
                </span>

                <strong>
                  {new Intl.NumberFormat(
                    "tr-TR",
                    {
                      style: "currency",
                      currency: "TRY",
                    },
                  ).format(
                    item.quantity *
                      item.unitPrice,
                  )}
                </strong>
              </div>
            ))
          )}
        </section>
                <section className={styles.section}>
          <h3>Sipariş Özeti</h3>

          <div className={styles.summaryRow}>
            <span>Sipariş No</span>
            <strong>{order.orderNumber}</strong>
          </div>

          <div className={styles.summaryRow}>
            <span>Toplam</span>

            <strong>
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(order.totalAmount)}
            </strong>
          </div>

          <div className={styles.summaryRow}>
            <span>Tarih</span>

            <strong>
              {new Date(order.createdAt).toLocaleString(
                "tr-TR",
              )}
            </strong>
          </div>
        </section>

        <section className={styles.section}>
          <h3>Kargo</h3>

          {order.shipment ? (
            <>
              <div className={styles.summaryRow}>
                <span>Firma</span>

                <strong>
                  {order.shipment.company ?? "-"}
                </strong>
              </div>

              <div className={styles.summaryRow}>
                <span>Takip No</span>

                <strong>
                  {order.shipment.trackingNumber ??
                    "-"}
                </strong>
              </div>
            </>
          ) : (
            <p>Henüz kargo oluşturulmadı.</p>
          )}
        </section>

        <section className={styles.section}>
          <h3>Adres</h3>

          <div className={styles.address}>
            <strong>{order.shippingName}</strong>

            <br />

            {order.shippingPhone}

            <br />
            <br />

            {order.shippingAddress}

            <br />

            {order.shippingDistrict} /{" "}
            {order.shippingCity}
          </div>
        </section>

        <section className={styles.section}>
          <h3>Notlar</h3>

          <textarea
            className={styles.note}
            defaultValue={
              order.internalNote ??
              order.customerNote ??
              ""
            }
            placeholder="Sipariş notu..."
          />
        </section>

        <footer className={styles.footer}>
          <button
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={saving}
          >
            Kapat
          </button>

          <button
            className={styles.primaryButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Kaydediliyor..."
              : "Kaydet"}
          </button>
        </footer>
      </aside>
    </>
  );
}