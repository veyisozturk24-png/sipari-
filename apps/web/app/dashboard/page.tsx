"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession, getSession } from '@/lib/auth';
import AppIcon, { type AppIconName } from '@/components/app-icon';
import styles from './dashboard.module.css';
import OrdersTable from './orders-table';
import NewOrderButton from './new-order-button';
import { fetchDashboard, type DashboardData } from './dashboard-api';

const channelPresentation: Record<string, { label: string; icon: AppIconName; className: string }> = {
  WHATSAPP: { label: 'WhatsApp', icon: 'whatsapp', className: 'whatsapp' },
  INSTAGRAM: { label: 'Instagram', icon: 'instagram', className: 'instagram' },
  FACEBOOK: { label: 'Facebook', icon: 'message', className: 'web' },
  WEB: { label: 'Web Mağaza', icon: 'globe', className: 'web' },
  SHOPIFY: { label: 'Shopify', icon: 'globe', className: 'web' },
  WOOCOMMERCE: { label: 'WooCommerce', icon: 'globe', className: 'web' },
  TRENDYOL: { label: 'Trendyol', icon: 'shopping-bag', className: 'web' },
  HEPSIBURADA: { label: 'Hepsiburada', icon: 'shopping-bag', className: 'web' },
  MANUAL: { label: 'Manuel', icon: 'orders', className: 'web' },
};

const quickStartSteps: Array<{
  title: string;
  detail: string;
  href: string;
  icon: AppIconName;
}> = [
  {
    title: 'Ürünlerini ekle',
    detail: 'Fiyat ve stok bilgini gir.',
    href: '/dashboard/products',
    icon: 'box',
  },
  {
    title: 'Müşterini kaydet',
    detail: 'İlk alıcının bilgilerini oluştur.',
    href: '/dashboard/customers',
    icon: 'customers',
  },
  {
    title: 'İlk siparişini oluştur',
    detail: 'Sipariş ve stok akışını dene.',
    href: '/dashboard',
    icon: 'shopping-bag',
  },
  {
    title: 'Mesaj kanalını bağla',
    detail: 'WhatsApp mesajlarını tek ekranda yönet.',
    href: '/dashboard/inbox',
    icon: 'whatsapp',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<7 | 30>(7);
  const [currentHour, setCurrentHour] = useState<number | null>(null);
  const user = getSession()?.user;

  function signOut() {
    clearSession();
    router.replace('/giris');
  }

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

  useEffect(() => {
    const updateCurrentHour = () => setCurrentHour(new Date().getHours());
    updateCurrentHour();
    const timer = window.setInterval(updateCurrentHour, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const currency = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    });
    const overview = dashboard?.overview;

    return [
      { title: 'Bugünkü sipariş', value: String(overview?.todayOrders ?? 0), change: '', detail: 'Bugün', icon: 'shopping-bag' as AppIconName },
      { title: 'Bugünkü ciro', value: currency.format(overview?.todayRevenue ?? 0), change: '', detail: 'Bugün', icon: 'wallet' as AppIconName },
      { title: 'Bekleyen sipariş', value: String(overview?.pendingOrders ?? 0), change: '', detail: 'İşlem bekliyor', icon: 'orders' as AppIconName },
      { title: 'Aktif müşteriler', value: String(overview?.customers ?? 0), change: '', detail: 'Kayıtlı müşteri', icon: 'customers' as AppIconName },
    ];
  }, [dashboard]);

  const salesInPeriod = dashboard?.salesLast30Days.slice(-salesPeriod) ?? [];
  const periodRevenue = salesInPeriod.reduce((total, sale) => total + sale.revenue, 0);
  const periodOrders = salesInPeriod.reduce((total, sale) => total + sale.orders, 0);
  const maxRevenue = Math.max(...salesInPeriod.map((sale) => sale.revenue), 1);
  const chartPoints = salesInPeriod.map((sale, index) => {
    const x = salesInPeriod.length > 1 ? (index / (salesInPeriod.length - 1)) * 700 : 350;
    const y = 220 - (sale.revenue / maxRevenue) * 190;
    const showLabel = salesPeriod === 7 || index === 0 || index === salesInPeriod.length - 1 || index % 5 === 0;

    return {
      x,
      y,
      label: showLabel
        ? new Date(`${sale.date}T00:00:00`).toLocaleDateString('tr-TR', salesPeriod === 7 ? { weekday: 'short' } : { day: '2-digit', month: 'short' })
        : '',
    };
  });
  const chartLine = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const chartArea = chartPoints.length
    ? `M0,230 L${chartLine.replaceAll(' ', ' L')} L700,230 Z`
    : 'M0,230 L700,230 Z';
  const showQuickStart = dashboard !== null && dashboard.overview.totalOrders === 0;
  const chartScale = [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
    new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 })
      .format(maxRevenue * ratio),
  );
  const greeting = currentHour === null || currentHour < 12
    ? 'Günaydın'
    : currentHour < 18
      ? 'Tünaydın'
      : 'İyi akşamlar';

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
          <AppIcon name="chevron-down" size={16} className={styles.chevron} />
        </div>

        <nav className={styles.nav}>
          <p>MENÜ</p>
          <Link href="/dashboard" className={styles.active}>
            <span><AppIcon name="layout" /></span> Genel Bakış
          </Link>
          <Link href="/dashboard/inbox"><span><AppIcon name="inbox" /></span> Gelen Kutusu</Link>
          <Link href="/dashboard"><span><AppIcon name="orders" /></span> Siparişler</Link>
          <Link href="/dashboard/products"><span><AppIcon name="box" /></span> Ürünler</Link>
          <Link href="/dashboard/customers"><span><AppIcon name="customers" /></span> Müşteriler</Link>
          <Link href="/dashboard/products"><span><AppIcon name="stock" /></span> Stok Yönetimi</Link>

          <Link href="/dashboard/shipping">
            <span><AppIcon name="truck" /></span>
            Kargo Merkezi
          </Link>

          <p>YÖNETİM</p>
          <Link href="/dashboard/inbox"><span><AppIcon name="message" /></span> Kanallar</Link>
        </nav>

        <div className={styles.upgrade}>
          <span><AppIcon name="bolt" size={16} /></span>
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
          <button
            type="button"
            className={styles.profileMenu}
            aria-label="Hesap menüsü"
            aria-expanded={accountMenuOpen}
            onClick={() => setAccountMenuOpen((open) => !open)}
          >
            <AppIcon name="more" size={18} />
          </button>
          {accountMenuOpen && (
            <div className={styles.accountMenu}>
              <p>Hesap</p>
              <strong>{user?.name ?? 'Kullanıcı'}</strong>
              <small>{user?.email ?? ''}</small>
              <button type="button" onClick={signOut}>Güvenli çıkış yap</button>
            </div>
          )}
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>OPERASYON MERKEZİ</span>
            <h1>{greeting}, {user?.name?.split(' ')[0] ?? 'işletme sahibi'} <span>✦</span></h1>
            <p>İşletmende bugün neler olduğuna göz atalım.</p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconButton} aria-label="Bildirimler">
              <AppIcon name="bell" />
              <i />
            </button>
            <NewOrderButton />
          </div>
        </header>

        {showQuickStart && (
          <section className={styles.quickStart} aria-labelledby="quick-start-title">
            <div className={styles.quickStartIntro}>
              <span><AppIcon name="bolt" size={17} /></span>
              <div>
                <p>İLK 10 DAKİKA</p>
                <h2 id="quick-start-title">Siparİş’i kullanmaya başla</h2>
                <small>İlk siparişini oluşturduğunda bu rehber kendiliğinden kapanır.</small>
              </div>
            </div>
            <div className={styles.quickStartSteps}>
              {quickStartSteps.map((step, index) => (
                <Link href={step.href} key={step.title} className={styles.quickStartStep}>
                  <span className={styles.quickStartNumber}>{index + 1}</span>
                  <span className={styles.quickStartIcon}><AppIcon name={step.icon} size={17} /></span>
                  <span>
                    <strong>{step.title}</strong>
                    <small>{step.detail}</small>
                  </span>
                  <AppIcon name="arrow-right" size={15} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.statsGrid}>
          {stats.map((stat) => (
            <article className={styles.statCard} key={stat.title}>
              <div className={styles.statTop}>
                <span className={styles.statIcon}><AppIcon name={stat.icon} /></span>
                <button aria-label="Detaylar"><AppIcon name="more" size={17} /></button>
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
                <p>Seçtiğin dönemdeki sipariş ve ciro görünümü</p>
              </div>
              <select
                value={salesPeriod}
                onChange={(event) => setSalesPeriod(Number(event.target.value) as 7 | 30)}
                aria-label="Satış grafiği dönemi"
              >
                <option value="7">Son 7 gün</option>
                <option value="30">Son 30 gün</option>
              </select>
            </div>

            <div className={styles.revenueSummary}>
              <div>
                <span>Toplam ciro</span>
                <strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(periodRevenue)}</strong>
              </div>
              <span className={styles.growth}>{periodOrders} sipariş</span>
            </div>

            <div className={styles.chart}>
              <div className={styles.yLabels}>
                {chartScale.map((label, index) => <span key={index}>{label}</span>)}
              </div>

              <div className={styles.chartArea}>
                <div className={styles.gridLines}>
                  <i /><i /><i /><i /><i />
                </div>

                <svg
                  viewBox="0 0 700 230"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`Son ${salesPeriod} günlük satış grafiği`}
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
            </div>

            {dashboard?.channels.length ? (
              <div className={styles.channelList}>
                {dashboard.channels.map((channel) => {
                  const presentation = channelPresentation[channel.platform] ?? channelPresentation.MANUAL;
                  return (
                    <div className={styles.channel} key={`${channel.platform}-${channel.name}`}>
                      <span className={`${styles.channelIcon} ${styles[presentation.className]}`}>
                        <AppIcon name={presentation.icon} size={20} />
                      </span>
                      <div>
                        <strong>{channel.name || presentation.label}</strong>
                        <small>{channel.messages} mesaj · {channel.conversations} konuşma</small>
                      </div>
                      <div className={styles.channelRight}>
                        <small className={channel.isConnected ? styles.connectedStatus : styles.inactiveStatus}>
                          <i /> {channel.isConnected ? 'Bağlı' : 'Bağlı değil'}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyChannels}>Henüz bağlı bir satış kanalı yok.</p>
            )}

            <Link href="/dashboard/inbox" className={styles.connectButton}><AppIcon name="plus" size={16} /> Yeni kanal bağla</Link>
          </article>
        </section>

        <section className={styles.ordersCard}>
          <div className={styles.cardHeading}>
            <div>
              <h2>Son siparişler</h2>
              <p>Tüm kanallardan gelen en yeni siparişler</p>
            </div>
            <button className={styles.viewAll}>Tümünü görüntüle <AppIcon name="arrow-right" size={15} /></button>
          </div>
          <OrdersTable />
        </section>
      </main>
    </div>
  );
}
