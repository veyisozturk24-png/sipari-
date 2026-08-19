'use client';

import Link from 'next/link';

import AppIcon from '@/components/app-icon';
import NewOrderButton from '../new-order-button';
import OrdersTable from '../orders-table';
import styles from './orders.module.css';

export default function OrdersClient() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link className={styles.backLink} href="/dashboard">
            <span aria-hidden="true">←</span> Genel bakış
          </Link>
          <span className={styles.eyebrow}>SİPARİŞ YÖNETİMİ</span>
          <h1>Tüm siparişler</h1>
          <p>Manuel kaydettiğin ve bağlı kanallardan gelen siparişleri tek yerden takip et.</p>
        </div>
        <NewOrderButton />
      </header>

      <section className={styles.ordersCard} aria-labelledby="orders-title">
        <div className={styles.cardHeading}>
          <div>
            <h2 id="orders-title">Sipariş listesi</h2>
            <p>Bir siparişe dokunarak ayrıntılarını ve durumunu güncelleyebilirsin.</p>
          </div>
          <span className={styles.help}><AppIcon name="orders" size={17} /> Canlı liste</span>
        </div>
        <OrdersTable />
      </section>
    </main>
  );
}
