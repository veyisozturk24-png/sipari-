'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { createOrder } from '../order-api';
import styles from './inbox.module.css';

type Customer = {
  customerId: string;
  customer: string;
  phone: string;
  initials: string;
  channel: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number | string;
  stock: number;
};

type Props = {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
};

export default function ConvertOrderModal({ customer, isOpen, onClose }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('WhatsApp konuşmasından siparişe dönüştürüldü.');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );

  useEffect(() => {
    if (!isOpen || !customer.customerId) return;

    async function loadProducts() {
      try {
        const session = JSON.parse(window.localStorage.getItem('siparis_auth') ?? '{}');
        const companyId = session?.user?.companyMemberships?.[0]?.company?.id;
        if (!companyId) throw new Error('İşletme bilgisi bulunamadı.');

        const data = await apiFetch<Product[]>(`/products?companyId=${companyId}`);
        setProducts(data.filter((product) => product.stock > 0));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Ürünler yüklenemedi.');
      }
    }

    void loadProducts();
  }, [customer.customerId, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const count = Math.max(1, Number(quantity) || 1);
    if (!customer.customerId || !selectedProduct) {
      setError('Siparişe eklenecek ürünü seçin.');
      return;
    }
    if (count > selectedProduct.stock) {
      setError(`Yetersiz stok. Kullanılabilir stok: ${selectedProduct.stock}`);
      return;
    }

    try {
      setSaving(true);
      await createOrder({
        customerId: customer.customerId,
        items: [{ productId: selectedProduct.id, quantity: count }],
        customerNote: note.trim() || undefined,
        shippingName: customer.customer,
        shippingPhone: customer.phone === 'Telefon bilgisi yok' ? undefined : customer.phone,
        shippingAddress: address.trim() || undefined,
      });

      window.dispatchEvent(new Event('siparis:orders-changed'));
      onClose();
      router.push('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Sipariş oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.orderModalBackdrop} onClick={() => !saving && onClose()}>
      <section className={styles.convertOrderModal} role="dialog" aria-modal="true" aria-labelledby="convert-order-title" onClick={(event) => event.stopPropagation()}>
        <header className={styles.convertModalHeader}>
          <div>
            <span>WHATSAPP'TAN SİPARİŞ</span>
            <h2 id="convert-order-title">Siparişe dönüştür</h2>
            <p>Müşteri bilgileri konuşmadan otomatik getirildi.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Formu kapat">×</button>
        </header>

        <form className={styles.convertOrderForm} onSubmit={handleSubmit}>
          <div className={styles.convertCustomer}>
            <span>{customer.initials}</span>
            <div><strong>{customer.customer}</strong><small>{customer.phone} · {customer.channel}</small></div>
            <b>Hazır</b>
          </div>

          <div className={styles.convertFormSection}>
            <h3>Ürün bilgileri</h3>
            <div className={styles.convertFormGrid}>
              <label className={styles.convertFullField}>
                <span>Ürün *</span>
                <select autoFocus value={productId} onChange={(event) => setProductId(event.target.value)} disabled={saving}>
                  <option value="">Stoktaki ürünü seçin</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.stock} adet · ₺{Number(product.price).toLocaleString('tr-TR')}</option>)}
                </select>
              </label>
              <label><span>Adet</span><input type="number" min="1" max={selectedProduct?.stock ?? undefined} value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={saving} /></label>
              <label><span>Toplam</span><div className={styles.convertMoneyInput}><b>₺</b><input readOnly value={selectedProduct ? (Number(selectedProduct.price) * Math.max(1, Number(quantity) || 1)).toLocaleString('tr-TR') : '0'} /></div></label>
            </div>
          </div>

          <div className={styles.convertFormSection}>
            <h3>Teslimat ve not</h3>
            <div className={styles.convertFormGrid}>
              <label className={styles.convertFullField}><span>Teslimat adresi</span><textarea rows={3} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Müşterinin WhatsApp’tan ilettiği adres" disabled={saving} /></label>
              <label className={styles.convertFullField}><span>Sipariş notu</span><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} disabled={saving} /></label>
            </div>
          </div>

          {error && <div className={styles.convertFormError}>{error}</div>}
          <footer className={styles.convertModalActions}>
            <button type="button" className={styles.convertCancelButton} onClick={onClose} disabled={saving}>Vazgeç</button>
            <button type="submit" className={styles.convertSubmitButton} disabled={saving || !products.length}><span>✓</span>{saving ? 'Kaydediliyor...' : 'Gerçek siparişi oluştur'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
