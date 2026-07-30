'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './mobile-navigation.module.css';

const items = [
  { href: '/dashboard', label: 'Özet', icon: '▦' },
  { href: '/dashboard/inbox', label: 'Mesajlar', icon: '◌' },
  { href: '/dashboard/products', label: 'Ürünler', icon: '◇' },
  { href: '/dashboard/customers', label: 'Müşteriler', icon: '◉' },
  { href: '/dashboard/shipping', label: 'Kargo', icon: '▤' },
];

export default function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation} aria-label="Mobil menü">
      {items.map((item) => {
        const active = item.href === '/dashboard'
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link key={item.href} href={item.href} className={active ? styles.active : ''}>
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
