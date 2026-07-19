"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./shipping.module.css";

type ShippingStatus =
  | "Hazırlanıyor"
  | "Kargoya verildi"
  | "Dağıtımda"
  | "Teslim edildi";

type Shipment = {
  id: string;
  orderNumber: string;
  customerName: string;
  company: string;
  trackingNumber: string;
  status: ShippingStatus;
  createdAt: string;
};

const initialShipments: Shipment[] = [
  {
    id: "1",
    orderNumber: "SIP-1001",
    customerName: "Ayşe Yılmaz",
    company: "Yurtiçi Kargo",
    trackingNumber: "YK123456789",
    status: "Kargoya verildi",
    createdAt: "18.07.2026",
  },
  {
    id: "2",
    orderNumber: "SIP-1002",
    customerName: "Mehmet Kaya",
    company: "Aras Kargo",
    trackingNumber: "AR987654321",
    status: "Dağıtımda",
    createdAt: "18.07.2026",
  },
  {
    id: "3",
    orderNumber: "SIP-1003",
    customerName: "Zeynep Demir",
    company: "MNG Kargo",
    trackingNumber: "MNG456789123",
    status: "Teslim edildi",
    createdAt: "17.07.2026",
  },
];

const statusOptions: ShippingStatus[] = [
  "Hazırlanıyor",
  "Kargoya verildi",
  "Dağıtımda",
  "Teslim edildi",
];

export default function ShippingClient() {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");

  useEffect(() => {
    const savedShipments = localStorage.getItem("siparis_shipments");

    if (savedShipments) {
      try {
        setShipments(JSON.parse(savedShipments));
      } catch {
        localStorage.removeItem("siparis_shipments");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("siparis_shipments", JSON.stringify(shipments));
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const text = search.toLocaleLowerCase("tr-TR");

      const matchesSearch =
        shipment.orderNumber.toLocaleLowerCase("tr-TR").includes(text) ||
        shipment.customerName.toLocaleLowerCase("tr-TR").includes(text) ||
        shipment.trackingNumber.toLocaleLowerCase("tr-TR").includes(text) ||
        shipment.company.toLocaleLowerCase("tr-TR").includes(text);

      const matchesStatus =
        statusFilter === "Tümü" || shipment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, statusFilter]);

  const updateStatus = (id: string, status: ShippingStatus) => {
    setShipments((current) =>
      current.map((shipment) =>
        shipment.id === id ? { ...shipment, status } : shipment,
      ),
    );
  };

  const summary = {
    total: shipments.length,
    preparing: shipments.filter((item) => item.status === "Hazırlanıyor").length,
    shipping: shipments.filter(
      (item) =>
        item.status === "Kargoya verildi" || item.status === "Dağıtımda",
    ).length,
    delivered: shipments.filter((item) => item.status === "Teslim edildi")
      .length,
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Siparİş Operasyon</p>
          <h1>Kargo Merkezi</h1>
          <p className={styles.description}>
            Gönderileri ve teslimat durumlarını tek ekrandan yönetin.
          </p>
        </div>

        <button className={styles.primaryButton} type="button">
          Yeni gönderi
        </button>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span>Toplam gönderi</span>
          <strong>{summary.total}</strong>
        </article>

        <article className={styles.summaryCard}>
          <span>Hazırlanıyor</span>
          <strong>{summary.preparing}</strong>
        </article>

        <article className={styles.summaryCard}>
          <span>Yolda</span>
          <strong>{summary.shipping}</strong>
        </article>

        <article className={styles.summaryCard}>
          <span>Teslim edildi</span>
          <strong>{summary.delivered}</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            type="search"
            placeholder="Sipariş, müşteri veya takip numarası ara"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className={styles.filter}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="Tümü">Tüm durumlar</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sipariş</th>
                <th>Müşteri</th>
                <th>Kargo firması</th>
                <th>Takip numarası</th>
                <th>Tarih</th>
                <th>Durum</th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>
                    <strong>{shipment.orderNumber}</strong>
                  </td>
                  <td>{shipment.customerName}</td>
                  <td>{shipment.company}</td>
                  <td>
                    <code>{shipment.trackingNumber}</code>
                  </td>
                  <td>{shipment.createdAt}</td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={shipment.status}
                      onChange={(event) =>
                        updateStatus(
                          shipment.id,
                          event.target.value as ShippingStatus,
                        )
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredShipments.length === 0 && (
            <div className={styles.emptyState}>
              Arama kriterlerine uygun gönderi bulunamadı.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
