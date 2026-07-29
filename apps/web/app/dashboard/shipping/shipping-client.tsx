"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api";
import { getActiveCompanyId } from "@/lib/auth";

import { fetchOrders } from "../order-api";
import type { ApiOrder } from "../order-types";
import styles from "./shipping.module.css";

const shipmentStatuses = [
  "PREPARING",
  "READY",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

type ShipmentStatus = (typeof shipmentStatuses)[number];
type ShippingCarrier =
  | "YURTICI"
  | "ARAS"
  | "MNG"
  | "PTT"
  | "SURAT"
  | "HEPSIJET"
  | "KOLAY_GELSIN"
  | "OTHER";

type ApiShipment = {
  id: string;
  carrier: ShippingCarrier;
  trackingNumber: string | null;
  status: ShipmentStatus;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    shippingName: string | null;
    customer: { name: string } | null;
  };
};

const statusLabels: Record<ShipmentStatus, string> = {
  PREPARING: "Hazırlanıyor",
  READY: "Gönderiye hazır",
  SHIPPED: "Kargoya verildi",
  IN_TRANSIT: "Yolda",
  OUT_FOR_DELIVERY: "Dağıtımda",
  DELIVERED: "Teslim edildi",
};

const carrierLabels: Record<ShippingCarrier, string> = {
  YURTICI: "Yurtiçi Kargo",
  ARAS: "Aras Kargo",
  MNG: "MNG Kargo",
  PTT: "PTT Kargo",
  SURAT: "Sürat Kargo",
  HEPSIJET: "HepsiJET",
  KOLAY_GELSIN: "Kolay Gelsin",
  OTHER: "Diğer",
};

function getNextStatuses(status: ShipmentStatus) {
  const transitions: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
    PREPARING: ["READY"],
    READY: ["SHIPPED"],
    SHIPPED: ["IN_TRANSIT"],
    IN_TRANSIT: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
  };

  return [status, ...(transitions[status] ?? [])];
}

export default function ShippingClient() {
  const companyId = getActiveCompanyId();
  const [shipments, setShipments] = useState<ApiShipment[]>([]);
  const [availableOrders, setAvailableOrders] = useState<ApiOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ShipmentStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [carrier, setCarrier] = useState<ShippingCarrier>("YURTICI");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [shipmentData, orderData] = await Promise.all([
        apiFetch<ApiShipment[]>(`/shipments?companyId=${companyId}`),
        fetchOrders(),
      ]);

      setShipments(shipmentData);
      setAvailableOrders(
        orderData.filter(
          (order) => order.status === "PREPARING" && !order.shipment,
        ),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Kargo kayıtları yüklenemedi.",
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const filteredShipments = useMemo(() => {
    const text = search.toLocaleLowerCase("tr-TR");

    return shipments.filter((shipment) => {
      const customerName =
        shipment.order.customer?.name ?? shipment.order.shippingName ?? "";
      const matchesSearch = [
        shipment.order.orderNumber,
        customerName,
        shipment.trackingNumber ?? "",
        carrierLabels[shipment.carrier],
      ].some((value) => value.toLocaleLowerCase("tr-TR").includes(text));

      return matchesSearch && (statusFilter === "ALL" || shipment.status === statusFilter);
    });
  }, [search, shipments, statusFilter]);

  const summary = {
    total: shipments.length,
    preparing: shipments.filter((item) => item.status === "PREPARING" || item.status === "READY").length,
    shipping: shipments.filter(
      (item) => item.status === "SHIPPED" || item.status === "IN_TRANSIT" || item.status === "OUT_FOR_DELIVERY",
    ).length,
    delivered: shipments.filter((item) => item.status === "DELIVERED").length,
  };

  async function updateStatus(id: string, status: ShipmentStatus) {
    setSaving(true);
    setError("");

    try {
      const shipment = await apiFetch<ApiShipment>(
        `/shipments/${id}/status?companyId=${companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      setShipments((current) =>
        current.map((item) => (item.id === shipment.id ? shipment : item)),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Kargo durumu güncellenemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createShipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!orderId || !trackingNumber.trim()) {
      setError("Sipariş ve takip numarası zorunludur.");
      return;
    }

    setSaving(true);

    try {
      await apiFetch<ApiShipment>("/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          orderId,
          carrier,
          trackingNumber: trackingNumber.trim(),
        }),
      });

      setIsCreateOpen(false);
      setOrderId("");
      setTrackingNumber("");
      await loadData();
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : "Kargo kaydı oluşturulamadı.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Siparİş Operasyon</p>
          <h1>Kargo Merkezi</h1>
          <p className={styles.description}>Gönderileri ve teslimat durumlarını tek ekrandan yönetin.</p>
        </div>

        <button className={styles.primaryButton} type="button" onClick={() => setIsCreateOpen(true)}>
          Yeni gönderi
        </button>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}><span>Toplam gönderi</span><strong>{summary.total}</strong></article>
        <article className={styles.summaryCard}><span>Hazırlanıyor</span><strong>{summary.preparing}</strong></article>
        <article className={styles.summaryCard}><span>Yolda</span><strong>{summary.shipping}</strong></article>
        <article className={styles.summaryCard}><span>Teslim edildi</span><strong>{summary.delivered}</strong></article>
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <input className={styles.search} type="search" placeholder="Sipariş, müşteri veya takip numarası ara" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className={styles.filter} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | ShipmentStatus)}>
            <option value="ALL">Tüm durumlar</option>
            {shipmentStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </div>

        {error && <p className={styles.message}>{error}</p>}
        {loading ? <p className={styles.emptyState}>Kargo kayıtları yükleniyor...</p> : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Sipariş</th><th>Müşteri</th><th>Kargo firması</th><th>Takip numarası</th><th>Tarih</th><th>Durum</th></tr></thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td><strong>{shipment.order.orderNumber}</strong></td>
                    <td>{shipment.order.customer?.name ?? shipment.order.shippingName ?? "-"}</td>
                    <td>{carrierLabels[shipment.carrier]}</td>
                    <td><code>{shipment.trackingNumber ?? "-"}</code></td>
                    <td>{new Date(shipment.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td><select className={styles.statusSelect} value={shipment.status} disabled={saving} onChange={(event) => void updateStatus(shipment.id, event.target.value as ShipmentStatus)}>{getNextStatuses(shipment.status).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredShipments.length === 0 && <div className={styles.emptyState}>Arama kriterlerine uygun gönderi bulunamadı.</div>}
          </div>
        )}
      </section>

      {isCreateOpen && (
        <div className={styles.modalBackdrop} onClick={() => !saving && setIsCreateOpen(false)}>
          <form className={styles.modal} onSubmit={createShipment} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}><div><p className={styles.eyebrow}>YENİ GÖNDERİ</p><h2>Kargo oluştur</h2></div><button type="button" onClick={() => setIsCreateOpen(false)} disabled={saving}>×</button></div>
            <label>Sipariş<select value={orderId} onChange={(event) => setOrderId(event.target.value)} disabled={saving}><option value="">Sipariş seçin</option>{availableOrders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber} · {order.customer?.name ?? order.shippingName ?? "Müşteri"}</option>)}</select></label>
            <label>Kargo firması<select value={carrier} onChange={(event) => setCarrier(event.target.value as ShippingCarrier)} disabled={saving}>{Object.entries(carrierLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Takip numarası<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Takip numarasını girin" disabled={saving} /></label>
            {availableOrders.length === 0 && <p className={styles.message}>Kargoya hazır sipariş bulunmuyor. Siparişi önce “Hazırlanıyor” durumuna alın.</p>}
            <div className={styles.modalActions}><button type="button" onClick={() => setIsCreateOpen(false)} disabled={saving}>Vazgeç</button><button className={styles.primaryButton} type="submit" disabled={saving || availableOrders.length === 0}>{saving ? "Kaydediliyor..." : "Kargo oluştur"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
