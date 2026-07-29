"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import styles from './dashboard.module.css';
import OrdersTable from './orders-table';
import NewOrderButton from './new-order-button';
import { fetchDashboard, type DashboardData } from './dashboard-api';

const channels = [
  {
    name: 'WhatsApp',
    detail: '12 yeni mesaj',
    orders: '16 sipariş',
    icon: 'WA',
    className: 'whatsapp',
  },
  {
    name: 'Instagram',
    detail: '5 yeni mesaj',
    orders: '6 sipariş',
    icon: 'IG',
    className: 'instagram',
  },
  {
    name: 'Web Mağaza',
    detail: 'Tüm sistemler aktif',
    orders: '2 sipariş',
    icon: 'WEB',
    className: 'web',
  },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const user = getSession()?.user;

  useEffect(() => {
    const loadDashboard = async () => setDashboard(await fetchDashboard());
    const timer = window.setTimeout(
      () => void loadDashboard().catch(console.error),
      0,
    );
    const refresh = () => void loadDashboard().catch(console.error);

    window.addEventListener('siparis:orders-changed', refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('siparis:orders-changed', refresh);
    };
  }, []);

  const stats = useMemo(() => {
    const currency = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    });
    const overview = dashboard?.overview;

    return [
      { title: 'Bugünkü sipariş', value: String(overview?.todayOrders ?? 0), change: '', detail: 'Bugün', icon: '🛍️' },
      { title: 'Bugünkü ciro', value: currency.format(overview?.todayRevenue ?? 0), change: '', detail: 'Bugün', icon: '₺' },
      { title: 'Bekleyen sipariş', value: String(overview?.pendingOrders ?? 0), change: '', detail: 'İşlem bekliyor', icon: '⏱' },
      { title: 'Aktif müşteriler', value: String(overview?.customers ?? 0), change: '', detail: 'Kayıtlı müşteri', icon: '👥' },
    ];
  }, [dashboard]);

  const weeklySales = dashboard?.salesLast30Days.slice(-7) ?? [];
  const maxRevenue = Math.max(...weeklySales.map((sale) => sale.revenue), 1);
  const chartPoints = weeklySales.map((sale, index) => {
    const x = weeklySales.length > 1 ? (index / (weeklySales.length - 1)) * 700 : 350;
    const y = 220 - (sale.revenue / maxRevenue) * 190;

    return { x, y, label: new Date(`${sale.date}T00:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' }) };
  });
  const chartLine = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const chartArea = chartPoints.length
    ? `M0,230 L${chartLine.replaceAll(' ', ' L')} L700,230 Z`
    : 'M0,230 L700,230 Z';

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>S</span>
          <span>Sipar<span>İş</span></span>
        </Link>

        <div className={styles.workspace}>
          <span className={styles.workspaceAvatar}>VM</span>
          <div>
            <strong>{user?.companyMemberships[0]?.company.name ?? 'İşletme'}</strong>
            <small>{user?.companyMemberships[0]?.role ?? 'Kullanıcı'} hesabı</small>
          </div>
          <span className={styles.chevron}>⌄</span>
        </div>

        <nav className={styles.nav}>
          <p>MENÜ</p>
          <Link href="/dashboard" className={styles.active}>
            <span>▦</span> Genel Bakış
          </Link>
          <Link href="/dashboard/inbox"><span>💬</span> Gelen Kutusu <b>17</b></Link>
          <a href="#"><span>▣</span> Siparişler <b>7</b></a>
          <Link href="/dashboard/products"><span>◇</span> Ürünler</Link>
          <Link href="/dashboard/customers"><span>◉</span> Müşteriler</Link>
          <Link href="/dashboard/products"><span>▤</span> Stok Yönetimi</Link>

          <Link href="/dashboard/shipping">
            <span>🚚</span>
            Kargo Merkezi
          </Link>

          <p>YÖNETİM</p>
          <a href="#"><span>⌁</span> Kanallar</a>
          <a href="#"><span>⚙</span> Ayarlar</a>
        </nav>

        <div className={styles.upgrade}>
          <span>⚡</span>
          <strong>İşini büyüt</strong>
          <p>Daha fazla kanal ve otomasyon için planını yükselt.</p>
          <button>Planları incele</button>
        </div>

        <div className={styles.profile}>
          <span className={styles.profileAvatar}>VÖ</span>
          <div>
            <strong>{user?.name ?? 'Kullanıcı'}</strong>
            <small>{user?.email ?? ''}</small>
          </div>
          <span>⋮</span>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Günaydın, {user?.name?.split(' ')[0] ?? '👋'} 👋</h1>
            <p>İşletmende bugün neler olduğuna göz atalım.</p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconButton} aria-label="Bildirimler">
              ♢
              <i />
            </button>
            <NewOrderButton />
          </div>
        </header>

        <section className={styles.statsGrid}>
          {stats.map((stat) => (
            <article className={styles.statCard} key={stat.title}>
              <div className={styles.statTop}>
                <span className={styles.statIcon}>{stat.icon}</span>
                <button aria-label="Detaylar">⋮</button>
              </div>
              <p>{stat.title}</p>
              <strong>{stat.value}</strong>
              <small>
                <b>{stat.change}</b> {stat.detail}
              </small>
            </article>
          ))}
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.revenueCard}>
            <div className={styles.cardHeading}>
              <div>
                <h2>Satış performansı</h2>
                <p>Son 7 günlük sipariş ve ciro görünümü</p>
              </div>
              <select defaultValue="7">
                <option value="7">Son 7 gün</option>
                <option value="30">Son 30 gün</option>
              </select>
            </div>

            <div className={styles.revenueSummary}>
              <div>
                <span>Toplam ciro</span>
                <strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(dashboard?.overview.totalRevenue ?? 0)}</strong>
              </div>
              <span className={styles.growth}>{dashboard?.overview.totalOrders ?? 0} sipariş</span>
            </div>

            <div className={styles.chart}>
              <div className={styles.yLabels}>
                <span>20B</span>
                <span>15B</span>
                <span>10B</span>
                <span>5B</span>
                <span>0</span>
              </div>

              <div className={styles.chartArea}>
                <div className={styles.gridLines}>
                  <i /><i /><i /><i /><i />
                </div>

                <svg
                  viewBox="0 0 700 230"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Son yedi günlük satış grafiği"
                >
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path className={styles.area} d={chartArea} />
                  <polyline className={styles.line} points={chartLine} fill="none" />
                  {chartPoints.map((point) => (
                    <circle key={point.x} cx={point.x} cy={point.y} r="5" />
                  ))}
                </svg>

                <div className={styles.xLabels}>
                  {chartPoints.map((point) => <span key={point.x}>{point.label}</span>)}
                </div>
              </div>
            </div>
          </article>

          <article className={styles.channelsCard}>
            <div className={styles.cardHeading}>
              <div>
                <h2>Satış kanalları</h2>
                <p>Bağlı kanalların durumu</p>
              </div>
              <button>⋯</button>
            </div>

            <div className={styles.channelList}>
              {channels.map((channel) => (
                <div className={styles.channel} key={channel.name}>
                  <span className={`${styles.channelIcon} ${styles[channel.className]}`}>
                    {channel.icon}
                  </span>
                  <div>
                    <strong>{channel.name}</strong>
                    <small>{channel.detail}</small>
                  </div>
                  <div className={styles.channelRight}>
                    <strong>{channel.orders}</strong>
                    <small><i /> Aktif</small>
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.connectButton}>＋ Yeni kanal bağla</button>
          </article>
        </section>

        <section className={styles.ordersCard}>
          <div className={styles.cardHeading}>
            <div>
              <h2>Son siparişler</h2>
              <p>Tüm kanallardan gelen en yeni siparişler</p>
            </div>
            <button className={styles.viewAll}>Tümünü görüntüle →</button>
          </div>
          <OrdersTable />
        </section>
      </main>
    </div>
  );
}
