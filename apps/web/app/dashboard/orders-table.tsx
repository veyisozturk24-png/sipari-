'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

type OrderStatusType = 'new' | 'preparing' | 'shipping' | 'completed';

type Order = {
  id: string;
  customer: string;
  phone: string;
  initials: string;
  channel: string;
  product: string;
  products: string[];
  amount: string;
  status: string;
  statusType: OrderStatusType;
  address: string;
  note: string;
  time: string;
};

const initialOrders: Order[] = [
  {
    id: '#SP-1048',
    customer: 'Ayşe Yılmaz',
    phone: '0555 321 45 67',
    initials: 'AY',
    channel: 'WhatsApp',
    product: '2 ürün',
    products: [
      'Oversize siyah sweatshirt × 1',
      'Basic beyaz tişört × 1',
    ],
    amount: '₺1.240',
    status: 'Yeni',
    statusType: 'new',
    address: 'Kadıköy, İstanbul',
    note: 'Mümkünse bugün kargoya verilsin.',
    time: '5 dk önce',
  },
  {
    id: '#SP-1047',
    customer: 'Mehmet Kaya',
    phone: '0532 440 18 22',
    initials: 'MK',
    channel: 'Instagram',
    product: '1 ürün',
    products: ['Slim fit kot pantolon × 1'],
    amount: '₺780',
    status: 'Hazırlanıyor',
    statusType: 'preparing',
    address: 'Çankaya, Ankara',
    note: 'Kapıda ödeme talep edildi.',
    time: '18 dk önce',
  },
  {
    id: '#SP-1046',
    customer: 'Selin Demir',
    phone: '0544 771 29 10',
    initials: 'SD',
    channel: 'WhatsApp',
    product: '3 ürün',
    products: [
      'Kadın trençkot × 1',
      'Deri omuz çantası × 1',
      'Desenli fular × 1',
    ],
    amount: '₺2.150',
    status: 'Kargoda',
    statusType: 'shipping',
    address: 'Nilüfer, Bursa',
    note: 'Kargo takip bilgisi müşteriye gönderildi.',
    time: '42 dk önce',
  },
  {
    id: '#SP-1045',
    customer: 'Can Öztürk',
    phone: '0507 615 90 31',
    initials: 'CÖ',
    channel: 'Instagram',
    product: '1 ürün',
    products: ['Polo yaka lacivert tişört × 1'],
    amount: '₺560',
    status: 'Tamamlandı',
    statusType: 'completed',
    address: 'Konak, İzmir',
    note: 'Sipariş teslim edildi.',
    time: '1 sa önce',
  },
  {
    id: '#SP-1044',
    customer: 'Zeynep Arslan',
    phone: '0538 219 74 56',
    initials: 'ZA',
    channel: 'Web',
    product: '2 ürün',
    products: [
      'Kadın blazer ceket × 1',
      'Kumaş pantolon × 1',
    ],
    amount: '₺1.890',
    status: 'Tamamlandı',
    statusType: 'completed',
    address: 'Muratpaşa, Antalya',
    note: 'Fatura e-posta ile gönderildi.',
    time: '2 sa önce',
  },
];

const nextStatus: Record<
  OrderStatusType,
  { status: string; statusType: OrderStatusType }
> = {
  new: {
    status: 'Hazırlanıyor',
    statusType: 'preparing',
  },
  preparing: {
    status: 'Kargoda',
    statusType: 'shipping',
  },
  shipping: {
    status: 'Tamamlandı',
    statusType: 'completed',
  },
  completed: {
    status: 'Tamamlandı',
    statusType: 'completed',
  },
};

const actionLabels: Record<OrderStatusType, string> = {
  new: 'Siparişi hazırla',
  preparing: 'Kargoya ver',
  shipping: 'Teslim edildi',
  completed: 'Sipariş tamamlandı',
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;

  useEffect(() => {
    try {
      const storedOrders = JSON.parse(
        window.localStorage.getItem('siparis:custom-orders') || '[]',
      );

      if (Array.isArray(storedOrders) && storedOrders.length > 0) {
        setOrders([
          ...storedOrders,
          ...initialOrders.filter(
            (initialOrder) =>
              !storedOrders.some(
                (storedOrder: Order) => storedOrder.id === initialOrder.id,
              ),
          ),
        ]);
      }
    } catch {
      window.localStorage.removeItem('siparis:custom-orders');
    }
  }, []);

  useEffect(() => {
    function addNewOrder(event: Event) {
      const customEvent = event as CustomEvent<Order>;

      setOrders((currentOrders) => [
        customEvent.detail,
        ...currentOrders,
      ]);

      setToast(
        `${customEvent.detail.id} siparişi başarıyla oluşturuldu.`,
      );
    }

    window.addEventListener('siparis:new-order', addNewOrder);

    return () => {
      window.removeEventListener('siparis:new-order', addNewOrder);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedOrder ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedOrder]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedOrderId(null);
      }
    };

    window.addEventListener('keydown', closeWithEscape);

    return () => {
      window.removeEventListener('keydown', closeWithEscape);
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  function advanceOrderStatus(orderId: string) {
    const currentOrder = orders.find((order) => order.id === orderId);

    if (!currentOrder || currentOrder.statusType === 'completed') {
      return;
    }

    const updatedStatus = nextStatus[currentOrder.statusType];

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: updatedStatus.status,
              statusType: updatedStatus.statusType,
            }
          : order,
      ),
    );

    setToast(`${orderId} durumu “${updatedStatus.status}” olarak güncellendi.`);
  }

  function sendCustomerMessage() {
    if (!selectedOrder) {
      return;
    }

    setToast(`${selectedOrder.customer} için mesaj ekranı hazırlanacak.`);
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>SİPARİŞ</th>
              <th>MÜŞTERİ</th>
              <th>KANAL</th>
              <th>TUTAR</th>
              <th>DURUM</th>
              <th>ZAMAN</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className={styles.clickableRow}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <td>
                  <strong>{order.id}</strong>
                </td>

                <td>
                  <div className={styles.customer}>
                    <span>{order.initials}</span>

                    <div>
                      <strong>{order.customer}</strong>
                      <small>{order.product}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <span className={styles.channelBadge}>
                    {order.channel}
                  </span>
                </td>

                <td>
                  <strong>{order.amount}</strong>
                </td>

                <td>
                  <span
                    className={`${styles.status} ${styles[order.statusType]}`}
                  >
                    <i /> {order.status}
                  </span>
                </td>

                <td className={styles.time}>{order.time}</td>

                <td>
                  <button
                    type="button"
                    className={styles.rowButton}
                    aria-label={`${order.id} siparişini görüntüle`}
                  >
                    ›
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div
          className={styles.drawerBackdrop}
          onClick={() => setSelectedOrderId(null)}
        >
          <aside
            className={styles.orderDrawer}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedOrder.id} sipariş detayı`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              <div>
                <span>SİPARİŞ DETAYI</span>
                <h2>{selectedOrder.id}</h2>
                <small>{selectedOrder.time}</small>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                aria-label="Paneli kapat"
              >
                ×
              </button>
            </div>

            <div className={styles.drawerStatus}>
              <span
                className={`${styles.status} ${
                  styles[selectedOrder.statusType]
                }`}
              >
                <i /> {selectedOrder.status}
              </span>

              <span>{selectedOrder.channel} üzerinden geldi</span>
            </div>

            <section className={styles.drawerSection}>
              <h3>Müşteri</h3>

              <div className={styles.drawerCustomer}>
                <span>{selectedOrder.initials}</span>

                <div>
                  <strong>{selectedOrder.customer}</strong>
                  <small>{selectedOrder.phone}</small>
                </div>
              </div>
            </section>

            <section className={styles.drawerSection}>
              <h3>Ürünler</h3>

              <div className={styles.productList}>
                {selectedOrder.products.map((product) => (
                  <div key={product}>
                    <span>{product}</span>
                  </div>
                ))}
              </div>

              <div className={styles.drawerTotal}>
                <span>Toplam</span>
                <strong>{selectedOrder.amount}</strong>
              </div>
            </section>

            <section className={styles.drawerSection}>
              <h3>Teslimat adresi</h3>
              <p>{selectedOrder.address}</p>
            </section>

            <section className={styles.drawerSection}>
              <h3>Sipariş notu</h3>
              <p>{selectedOrder.note}</p>
            </section>

            <div className={styles.drawerActions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={sendCustomerMessage}
              >
                Müşteriye yaz
              </button>

              <button
                type="button"
                className={styles.drawerPrimaryAction}
                disabled={selectedOrder.statusType === 'completed'}
                onClick={() => advanceOrderStatus(selectedOrder.id)}
              >
                {actionLabels[selectedOrder.statusType]}
              </button>
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div className={styles.toast} role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </>
  );
}
