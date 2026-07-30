'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppIcon, { type AppIconName } from '@/components/app-icon';
import styles from './mobile-navigation.module.css';

const items = [
  { href: '/dashboard', label: 'Özet', icon: 'layout' as AppIconName },
  { href: '/dashboard/inbox', label: 'Mesajlar', icon: 'inbox' as AppIconName },
  { href: '/dashboard/products', label: 'Ürünler', icon: 'box' as AppIconName },
  { href: '/dashboard/customers', label: 'Müşteriler', icon: 'customers' as AppIconName },
  { href: '/dashboard/shipping', label: 'Kargo', icon: 'truck' as AppIconName },
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
            <span aria-hidden="true"><AppIcon name={item.icon} size={20} /></span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
