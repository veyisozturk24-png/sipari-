'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './customers.module.css';

type Channel = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Web';

type Customer = {
  id: string | number;
  name: string;
  initials: string;
  phone: string;
  email: string;
  channel: Channel;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastContact: string;
  status: 'active' | 'new' | 'passive';
  tags: string[];
  notes: string;
  orders: {
    id: string;
    date: string;
    amount: number;
    status: string;
  }[];
};

const demoCustomers: Customer[] = [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    initials: 'AY',
    phone: '0555 321 45 67',
    email: 'ayse@example.com',
    channel: 'WhatsApp',
    city: 'Kadıköy, İstanbul',
    totalOrders: 3,
    totalSpent: 3480,
    lastContact: '5 dk önce',
    status: 'active',
    tags: ['VIP müşteri', 'Hızlı ödeme'],
    notes: 'Siyah ve oversize ürünleri tercih ediyor.',
    orders: [
      {
        id: '#SP-1048',
        date: 'Bugün',
        amount: 1240,
        status: 'Hazırlanıyor',
      },
      {
        id: '#SP-1012',
        date: '12 Temmuz',
        amount: 980,
        status: 'Tamamlandı',
      },
      {
        id: '#SP-0987',
        date: '28 Haziran',
        amount: 1260,
        status: 'Tamamlandı',
      },
    ],
  },
  {
    id: 2,
    name: 'Mehmet Kaya',
    initials: 'MK',
    phone: '0532 440 18 22',
    email: 'mehmet@example.com',
    channel: 'Instagram',
    city: 'Çankaya, Ankara',
    totalOrders: 2,
    totalSpent: 1560,
    lastContact: '18 dk önce',
    status: 'active',
    tags: ['Kapıda ödeme'],
    notes: 'Pantolon ürünleriyle ilgileniyor.',
    orders: [
      {
        id: '#SP-1047',
        date: 'Bugün',
        amount: 780,
        status: 'Yeni',
      },
      {
        id: '#SP-0993',
        date: '2 Temmuz',
        amount: 780,
        status: 'Tamamlandı',
      },
    ],
  },
  {
    id: 3,
    name: 'Selin Demir',
    initials: 'SD',
    phone: '0544 771 29 10',
    email: 'selin@example.com',
    channel: 'WhatsApp',
    city: 'Nilüfer, Bursa',
    totalOrders: 5,
    totalSpent: 7250,
    lastContact: '42 dk önce',
    status: 'active',
    tags: ['VIP müşteri', 'Yüksek sepet'],
    notes: 'Dış giyim ve aksesuar kategorilerini tercih ediyor.',
    orders: [
      {
        id: '#SP-1046',
        date: 'Bugün',
        amount: 2150,
        status: 'Kargoda',
      },
      {
        id: '#SP-1023',
        date: '14 Temmuz',
        amount: 1850,
        status: 'Tamamlandı',
      },
      {
        id: '#SP-0977',
        date: '24 Haziran',
        amount: 1350,
        status: 'Tamamlandı',
      },
    ],
  },
  {
    id: 4,
    name: 'Can Öztürk',
    initials: 'CÖ',
    phone: '0507 615 90 31',
    email: 'can@example.com',
    channel: 'Facebook',
    city: 'Konak, İzmir',
    totalOrders: 1,
    totalSpent: 560,
    lastContact: 'Dün',
    status: 'new',
    tags: ['Yeni müşteri'],
    notes: 'İlk siparişini tamamladı.',
    orders: [
      {
        id: '#SP-1045',
        date: 'Dün',
        amount: 560,
        status: 'Tamamlandı',
      },
    ],
  },
  {
    id: 5,
    name: 'Zeynep Arslan',
    initials: 'ZA',
    phone: '0538 219 74 56',
    email: 'zeynep@example.com',
    channel: 'Web',
    city: 'Muratpaşa, Antalya',
    totalOrders: 4,
    totalSpent: 5640,
    lastContact: '2 gün önce',
    status: 'passive',
    tags: ['Web müşterisi'],
    notes: 'Son iki aydır yeni sipariş oluşturmadı.',
    orders: [
      {
        id: '#SP-1044',
        date: '2 gün önce',
        amount: 1890,
        status: 'Tamamlandı',
      },
      {
        id: '#SP-0951',
        date: '18 Haziran',
        amount: 1250,
        status: 'Tamamlandı',
      },
    ],
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<'all' | Channel>('all');
  const [selectedCustomerId, setSelectedCustomerId] =
    useState<string | number | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const companyId = process.env.NEXT_PUBLIC_COMPANY_ID;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

    if (!companyId) {
      setLoadError('NEXT_PUBLIC_COMPANY_ID tanımlı değil.');
      setIsLoading(false);
      return;
    }

    const resolvedCompanyId = companyId;

    async function loadCustomers() {
      try {
        setIsLoading(true);
        setLoadError('');

        const response = await fetch(
          `${apiUrl}/customers?companyId=${encodeURIComponent(resolvedCompanyId)}`,
        );

        if (!response.ok) {
          throw new Error(`Müşteriler alınamadı: ${response.status}`);
        }

        const data: {
          id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
        }[] = await response.json();

        setCustomers(
          data.map((customer) => {
            const nameParts = customer.name
              .trim()
              .split(/\s+/)
              .filter(Boolean);

            const initials =
              nameParts
                .slice(0, 2)
                .map((part) =>
                  part.charAt(0).toLocaleUpperCase('tr-TR'),
                )
                .join('') || 'M';

            return {
              id: customer.id,
              name: customer.name,
              initials,
              phone: customer.phone ?? '-',
              email: customer.email ?? '-',
              channel: 'Web',
              city: '-',
              totalOrders: 0,
              totalSpent: 0,
              lastContact: 'Henüz yok',
              status: 'new',
              tags: ['Yeni müşteri'],
              notes:
                customer.notes ?? 'Müşteri notu bulunmuyor.',
              orders: [],
            };
          }),
        );
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Müşteriler yüklenirken hata oluştu.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCustomers();
  }, []);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ??
    null;

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        `${customer.name} ${customer.phone} ${customer.email} ${customer.city}`
          .toLocaleLowerCase('tr-TR')
          .includes(query);

      const matchesChannel =
        channel === 'all' || customer.channel === channel;

      return matchesSearch && matchesChannel;
    });
  }, [customers, search, channel]);

  const totals = useMemo(() => {
    return {
      customers: customers.length,
      active: customers.filter(
        (customer) => customer.status === 'active',
      ).length,
      orders: customers.reduce(
        (total, customer) => total + customer.totalOrders,
        0,
      ),
      revenue: customers.reduce(
        (total, customer) => total + customer.totalSpent,
        0,
      ),
    };
  }, [customers]);

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 2400);
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>S</span>

          <span>
            Sipar<span>İş</span>
          </span>
        </Link>

        <div className={styles.workspace}>
          <span>VM</span>

          <div>
            <strong>Veyis Moda</strong>
            <small>Yönetici hesabı</small>
          </div>
        </div>

        <nav className={styles.nav}>
          <p>MENÜ</p>

          <Link href="/dashboard">
            <span>▦</span>
            Genel Bakış
          </Link>

          <Link href="/dashboard/inbox">
            <span>💬</span>
            Gelen Kutusu
            <b>3</b>
          </Link>

          <Link href="/dashboard">
            <span>▣</span>
            Siparişler
          </Link>

          <Link href="/dashboard/products">
            <span>◇</span>
            Ürünler
          </Link>

          <Link
            href="/dashboard/customers"
            className={styles.active}
          >
            <span>◉</span>
            Müşteriler
          </Link>

          <Link href="/dashboard/products">
            <span>▤</span>
            Stok Yönetimi
          </Link>

          <Link href="/dashboard/shipping">
            <span>🚚</span>
            Kargo Merkezi
          </Link>

          <p>YÖNETİM</p>

          <a href="#">
            <span>⌁</span>
            Kanallar
          </a>

          <a href="#">
            <span>⚙</span>
            Ayarlar
          </a>
        </nav>

        <div className={styles.profile}>
          <span>VÖ</span>

          <div>
            <strong>Veyis Öztürk</strong>
            <small>veyis@siparis.is</small>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div>
            <span>MÜŞTERİ YÖNETİMİ</span>
            <h1>Müşteriler</h1>
            <p>
              Tüm müşteri bilgilerini, siparişlerini ve
              görüşmelerini tek ekrandan takip et.
            </p>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={() =>
              showToast('Yeni müşteri formu sonraki adımda açılacak.')
            }
          >
            <span>＋</span>
            Yeni müşteri
          </button>
        </header>

        <section className={styles.stats}>
          <article>
            <span>Toplam müşteri</span>
            <strong>{totals.customers}</strong>
            <small>Tüm kayıtlı müşteriler</small>
          </article>

          <article>
            <span>Aktif müşteri</span>
            <strong>{totals.active}</strong>
            <small>Son dönemde etkileşimde</small>
          </article>

          <article>
            <span>Toplam sipariş</span>
            <strong>{totals.orders}</strong>
            <small>Müşteri siparişleri</small>
          </article>

          <article>
            <span>Toplam ciro</span>
            <strong>{formatCurrency(totals.revenue)}</strong>
            <small>Müşterilerden elde edilen</small>
          </article>
        </section>

        <section className={styles.customerCard}>
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Müşteri, telefon veya şehir ara..."
              />
            </div>

            <select
              value={channel}
              onChange={(event) =>
                setChannel(event.target.value as 'all' | Channel)
              }
            >
              <option value="all">Tüm kanallar</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Web">Web</option>
            </select>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>MÜŞTERİ</th>
                  <th>KANAL</th>
                  <th>KONUM</th>
                  <th>SİPARİŞ</th>
                  <th>TOPLAM HARCAMA</th>
                  <th>SON GÖRÜŞME</th>
                  <th>DURUM</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() =>
                      setSelectedCustomerId(customer.id)
                    }
                  >
                    <td>
                      <div className={styles.customerInfo}>
                        <span>{customer.initials}</span>

                        <div>
                          <strong>{customer.name}</strong>
                          <small>{customer.phone}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`${styles.channel} ${
                          styles[
                            customer.channel
                              .toLocaleLowerCase('tr-TR')
                              .replace('ı', 'i')
                          ]
                        }`}
                      >
                        {customer.channel}
                      </span>
                    </td>

                    <td>{customer.city}</td>

                    <td>
                      <strong>{customer.totalOrders}</strong>
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(customer.totalSpent)}
                      </strong>
                    </td>

                    <td>{customer.lastContact}</td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[customer.status]
                        }`}
                      >
                        <i />

                        {customer.status === 'active'
                          ? 'Aktif'
                          : customer.status === 'new'
                            ? 'Yeni'
                            : 'Pasif'}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        aria-label="Müşteri detayını aç"
                      >
                        ›
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className={styles.emptyState}>
                <span>👥</span>
                <strong>Müşteri bulunamadı</strong>
                <p>Arama veya kanal filtresini değiştir.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedCustomer && (
        <div
          className={styles.drawerBackdrop}
          onClick={() => setSelectedCustomerId(null)}
        >
          <aside
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.drawerHeader}>
              <div>
                <span>MÜŞTERİ DETAYI</span>
                <h2>{selectedCustomer.name}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
              >
                ×
              </button>
            </header>

            <section className={styles.profileCard}>
              <span>{selectedCustomer.initials}</span>
              <h3>{selectedCustomer.name}</h3>
              <p>{selectedCustomer.phone}</p>
              <small>{selectedCustomer.email}</small>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `${selectedCustomer.name} için mesaj ekranı açılacak.`,
                    )
                  }
                >
                  Mesaj gönder
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `${selectedCustomer.name} için sipariş formu açılacak.`,
                    )
                  }
                >
                  Sipariş oluştur
                </button>
              </div>
            </section>

            <section className={styles.drawerSection}>
              <h3>Müşteri bilgileri</h3>

              <dl>
                <div>
                  <dt>Satış kanalı</dt>
                  <dd>{selectedCustomer.channel}</dd>
                </div>

                <div>
                  <dt>Konum</dt>
                  <dd>{selectedCustomer.city}</dd>
                </div>

                <div>
                  <dt>Toplam sipariş</dt>
                  <dd>{selectedCustomer.totalOrders}</dd>
                </div>

                <div>
                  <dt>Toplam harcama</dt>
                  <dd>
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.drawerSection}>
              <h3>Etiketler</h3>

              <div className={styles.tags}>
                {selectedCustomer.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </section>

            <section className={styles.drawerSection}>
              <h3>Müşteri notu</h3>
              <p>{selectedCustomer.notes}</p>
            </section>

            <section className={styles.drawerSection}>
              <h3>Son siparişler</h3>

              <div className={styles.orderList}>
                {selectedCustomer.orders.map((order) => (
                  <div key={order.id}>
                    <span>
                      <strong>{order.id}</strong>
                      <small>{order.date}</small>
                    </span>

                    <span>
                      <strong>{formatCurrency(order.amount)}</strong>
                      <small>{order.status}</small>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}

      {toast && (
        <div className={styles.toast}>
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
