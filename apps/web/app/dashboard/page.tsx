import Link from 'next/link';
import styles from './dashboard.module.css';
import OrdersTable from './orders-table';
import NewOrderButton from './new-order-button';

const stats = [
  {
    title: 'Bugünkü sipariş',
    value: '24',
    change: '+%18',
    detail: 'Düne göre',
    icon: '🛍️',
  },
  {
    title: 'Bugünkü ciro',
    value: '₺18.450',
    change: '+%12',
    detail: 'Düne göre',
    icon: '₺',
  },
  {
    title: 'Bekleyen sipariş',
    value: '7',
    change: '3 acil',
    detail: 'İşlem bekliyor',
    icon: '⏱',
  },
  {
    title: 'Aktif müşteriler',
    value: '186',
    change: '+14',
    detail: 'Bu ay',
    icon: '👥',
  },
];

const orders = [
  {
    id: '#SP-1048',
    customer: 'Ayşe Yılmaz',
    initials: 'AY',
    channel: 'WhatsApp',
    product: '2 ürün',
    amount: '₺1.240',
    status: 'Yeni',
    statusType: 'new',
    time: '5 dk önce',
  },
  {
    id: '#SP-1047',
    customer: 'Mehmet Kaya',
    initials: 'MK',
    channel: 'Instagram',
    product: '1 ürün',
    amount: '₺780',
    status: 'Hazırlanıyor',
    statusType: 'preparing',
    time: '18 dk önce',
  },
  {
    id: '#SP-1046',
    customer: 'Selin Demir',
    initials: 'SD',
    channel: 'WhatsApp',
    product: '3 ürün',
    amount: '₺2.150',
    status: 'Kargoda',
    statusType: 'shipping',
    time: '42 dk önce',
  },
  {
    id: '#SP-1045',
    customer: 'Can Öztürk',
    initials: 'CÖ',
    channel: 'Instagram',
    product: '1 ürün',
    amount: '₺560',
    status: 'Tamamlandı',
    statusType: 'completed',
    time: '1 sa önce',
  },
  {
    id: '#SP-1044',
    customer: 'Zeynep Arslan',
    initials: 'ZA',
    channel: 'Web',
    product: '2 ürün',
    amount: '₺1.890',
    status: 'Tamamlandı',
    statusType: 'completed',
    time: '2 sa önce',
  },
];

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
            <strong>Veyis Moda</strong>
            <small>Yönetici hesabı</small>
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
            <strong>Veyis Öztürk</strong>
            <small>veyis@siparis.is</small>
          </div>
          <span>⋮</span>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Günaydın, Veyis 👋</h1>
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
                <strong>₺82.640</strong>
              </div>
              <span className={styles.growth}>↗ %16,8</span>
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
                  <path
                    className={styles.area}
                    d="M0 190 C55 175 80 130 135 145 C195 162 220 105 275 112 C330 119 365 62 420 80 C475 98 510 38 565 55 C620 72 648 20 700 28 L700 230 L0 230 Z"
                  />
                  <path
                    className={styles.line}
                    d="M0 190 C55 175 80 130 135 145 C195 162 220 105 275 112 C330 119 365 62 420 80 C475 98 510 38 565 55 C620 72 648 20 700 28"
                  />
                  {[['0','190'],['135','145'],['275','112'],['420','80'],['565','55'],['700','28']].map(
                    ([cx, cy]) => (
                      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
                    ),
                  )}
                </svg>

                <div className={styles.xLabels}>
                  <span>Pzt</span><span>Sal</span><span>Çar</span>
                  <span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
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
