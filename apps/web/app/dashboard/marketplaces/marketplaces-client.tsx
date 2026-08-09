'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getActiveCompanyId, getSession } from '@/lib/auth';
import styles from './marketplaces.module.css';

type MarketplaceConnection = {
  id: string;
  platform: 'TRENDYOL' | 'HEPSIBURADA';
  merchantId: string;
  status: 'CONNECTED' | 'ERROR';
  lastCheckedAt: string | null;
  lastError: string | null;
};

export default function MarketplacesClient() {
  const companyId = getActiveCompanyId();
  const user = getSession()?.user;
  const [connections, setConnections] = useState<MarketplaceConnection[]>([]);
  const [merchantId, setMerchantId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    async function loadConnections() {
      try {
        setConnections(await apiFetch<MarketplaceConnection[]>(`/marketplaces?companyId=${companyId}`));
      } catch {
        setToast('Pazaryeri bağlantıları yüklenemedi. Oturumunu yenileyip tekrar dene.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadConnections();
  }, [companyId]);

  const trendyol = connections.find((connection) => connection.platform === 'TRENDYOL');

  async function connectTrendyol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!companyId) {
      setToast('İşletme seçimi bulunamadı. Tekrar giriş yapıp dene.');
      return;
    }

    try {
      setIsSaving(true);
      const connection = await apiFetch<MarketplaceConnection>('/marketplaces/trendyol', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          merchantId: merchantId.trim(),
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
        }),
      });
      setConnections((current) => [
        ...current.filter((item) => item.platform !== 'TRENDYOL'),
        connection,
      ]);
      setApiKey('');
      setApiSecret('');
      setToast('Trendyol mağazası doğrulandı ve güvenli biçimde bağlandı. Sipariş aktarımı sıradaki adım.');
    } catch {
      setToast('Trendyol bağlantısı kurulamadı. Mağaza ID, API Key ve API Secret değerlerini satıcı panelinden yeniden kontrol et.');
    } finally {
      setIsSaving(false);
    }
  }

  const initials = (user?.name ?? 'K').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('tr-TR');

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}><span className={styles.logoMark}>S</span><span>Sipar<span>İş</span></span></Link>
        <div className={styles.workspace}><span>{initials}</span><div><strong>{user?.companyMemberships[0]?.company.name ?? 'İşletme'}</strong><small>Satış kanalları</small></div></div>
        <nav className={styles.nav}>
          <p>MENÜ</p>
          <Link href="/dashboard"><span>▦</span>Genel Bakış</Link>
          <Link href="/dashboard/inbox"><span>💬</span>Gelen Kutusu</Link>
          <Link href="/dashboard"><span>▣</span>Siparişler</Link>
          <Link href="/dashboard/products"><span>◇</span>Ürünler</Link>
          <Link href="/dashboard/customers"><span>◉</span>Müşteriler</Link>
          <Link href="/dashboard/shipping"><span>🚚</span>Kargo Merkezi</Link>
          <p>YÖNETİM</p>
          <Link href="/dashboard/inbox"><span>⌁</span>Kanallar</Link>
          <Link href="/dashboard/marketplaces" className={styles.active}><span>🛍</span>Pazaryerleri</Link>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>SATIŞ KANALLARI</span>
            <h1>Pazaryerlerini bağla</h1>
            <p>Mağazandaki siparişleri tek panelde toplamaya hazırlan.</p>
          </div>
          <Link href="/dashboard" className={styles.back}>← Panele dön</Link>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroIcon}>↻</div>
          <div><strong>Önce güvenli bağlantı, sonra otomasyon.</strong><p>Bağlantı test edilene kadar Siparİş mağazandaki stok, fiyat veya siparişleri değiştirmez.</p></div>
        </section>

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHead}><div><span className={styles.brandMark}>T</span><div><h2>Trendyol</h2><p>İlk bağlanacak pazaryeri</p></div></div><span className={trendyol?.status === 'CONNECTED' ? styles.connected : styles.ready}>{trendyol?.status === 'CONNECTED' ? 'Bağlı' : 'Hazır'}</span></div>
            {trendyol?.status === 'CONNECTED' ? (
              <div className={styles.connectedBox}>
                <strong>Mağaza bağlantısı aktif</strong>
                <p>Mağaza ID: <code>{trendyol.merchantId}</code></p>
                <small>Son doğrulama: {trendyol.lastCheckedAt ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(trendyol.lastCheckedAt)) : 'Az önce'}</small>
                <p className={styles.nextStep}>Sıradaki geliştirme: siparişleri güvenli şekilde içeri aktarma.</p>
              </div>
            ) : (
              <form onSubmit={connectTrendyol} className={styles.form}>
                <p className={styles.help}>Bu üç bilgiyi Trendyol Satıcı Paneli → Hesap Bilgilerim → Entegrasyon Bilgileri bölümünden al.</p>
                <label>Mağaza / Satıcı ID<input required value={merchantId} onChange={(event) => setMerchantId(event.target.value)} placeholder="Örn. 123456" autoComplete="off" /></label>
                <label>API Key<input required type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Trendyol API Key" autoComplete="new-password" /></label>
                <label>API Secret<input required type="password" value={apiSecret} onChange={(event) => setApiSecret(event.target.value)} placeholder="Trendyol API Secret" autoComplete="new-password" /></label>
                <button disabled={isSaving} type="submit">{isSaving ? 'Bağlantı test ediliyor…' : 'Bağlantıyı test et ve kaydet'}</button>
                <small className={styles.security}>Anahtarlar tarayıcıda saklanmaz; yalnızca şifrelenmiş biçimde sunucuda tutulur.</small>
              </form>
            )}
          </section>

          <section className={`${styles.card} ${styles.comingSoon}`}>
            <div className={styles.cardHead}><div><span className={styles.brandMark}>H</span><div><h2>Hepsiburada</h2><p>İkinci bağlantı</p></div></div><span className={styles.soon}>Yakında</span></div>
            <p>Trendyol akışı tamamlandıktan sonra Hepsiburada mağazanı aynı ekrandan yetkilendireceğiz.</p>
            <ul><li>Siparişleri içeri alma</li><li>Stok ve fiyat eşleme</li><li>Paket ve kargo akışı</li></ul>
          </section>
        </div>
        {isLoading ? <p className={styles.loading}>Bağlantılar kontrol ediliyor…</p> : null}
        {toast ? <div className={styles.toast} role="status">{toast}</div> : null}
      </main>
    </div>
  );
}
