'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './inbox.module.css';

type Customer = {
  customer: string;
  phone: string;
  initials: string;
  channel: string;
};

type Props = {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
};

type OrderForm = {
  productName: string;
  quantity: string;
  amount: string;
  address: string;
  note: string;
  paymentMethod: string;
};

const emptyForm: OrderForm = {
  productName: '',
  quantity: '1',
  amount: '',
  address: '',
  note: 'Müşteri konuşmasından siparişe dönüştürüldü.',
  paymentMethod: 'Kapıda ödeme',
};

function formatAmount(value: string) {
  const amount = Number(value.replace(/[^\d]/g, ''));

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function ConvertOrderModal({
  customer,
  isOpen,
  onClose,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', closeWithEscape);
    }

    return () => {
      window.removeEventListener('keydown', closeWithEscape);
    };
  }, [isOpen, onClose]);

  function updateField(field: keyof OrderForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!form.productName.trim() || !form.amount.trim()) {
      setError('Ürün adı ve sipariş tutarı zorunludur.');
      return;
    }

    const quantity = Math.max(1, Number(form.quantity) || 1);

    const newOrder = {
      id: `#SP-${Date.now().toString().slice(-5)}`,
      customer: customer.customer,
      phone: customer.phone,
      initials: customer.initials,
      channel: customer.channel,
      product: `${quantity} ürün`,
      products: [`${form.productName.trim()} × ${quantity}`],
      amount: formatAmount(form.amount),
      status: 'Yeni',
      statusType: 'new',
      address: form.address.trim() || 'Adres henüz girilmedi',
      note: `${form.note.trim() || 'Sipariş notu yok.'} Ödeme: ${
        form.paymentMethod
      }.`,
      time: 'Şimdi',
    };

    try {
      const savedOrders = JSON.parse(
        window.localStorage.getItem('siparis:custom-orders') || '[]',
      );

      const nextOrders = [
        newOrder,
        ...(Array.isArray(savedOrders) ? savedOrders : []),
      ].slice(0, 50);

      window.localStorage.setItem(
        'siparis:custom-orders',
        JSON.stringify(nextOrders),
      );
    } catch {
      window.localStorage.setItem(
        'siparis:custom-orders',
        JSON.stringify([newOrder]),
      );
    }

    setForm(emptyForm);
    onClose();
    router.push('/dashboard?orderCreated=1');
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.orderModalBackdrop} onClick={onClose}>
      <section
        className={styles.convertOrderModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-order-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.convertModalHeader}>
          <div>
            <span>KONUŞMADAN SİPARİŞ</span>
            <h2 id="convert-order-title">Siparişe dönüştür</h2>
            <p>Müşteri bilgileri konuşmadan otomatik alındı.</p>
          </div>

          <button type="button" onClick={onClose} aria-label="Formu kapat">
            ×
          </button>
        </header>

        <form className={styles.convertOrderForm} onSubmit={handleSubmit}>
          <div className={styles.convertCustomer}>
            <span>{customer.initials}</span>

            <div>
              <strong>{customer.customer}</strong>
              <small>
                {customer.phone} · {customer.channel}
              </small>
            </div>

            <b>Otomatik dolduruldu</b>
          </div>

          <div className={styles.convertFormSection}>
            <h3>Ürün bilgileri</h3>

            <div className={styles.convertFormGrid}>
              <label className={styles.convertFullField}>
                <span>Ürün adı *</span>
                <input
                  autoFocus
                  value={form.productName}
                  onChange={(event) =>
                    updateField('productName', event.target.value)
                  }
                  placeholder="Örn. Oversize siyah sweatshirt"
                />
              </label>

              <label>
                <span>Adet</span>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(event) =>
                    updateField('quantity', event.target.value)
                  }
                />
              </label>

              <label>
                <span>Toplam tutar *</span>

                <div className={styles.convertMoneyInput}>
                  <b>₺</b>

                  <input
                    inputMode="numeric"
                    value={form.amount}
                    onChange={(event) =>
                      updateField('amount', event.target.value)
                    }
                    placeholder="1250"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className={styles.convertFormSection}>
            <h3>Ödeme ve teslimat</h3>

            <div className={styles.convertFormGrid}>
              <label className={styles.convertFullField}>
                <span>Ödeme yöntemi</span>

                <select
                  value={form.paymentMethod}
                  onChange={(event) =>
                    updateField('paymentMethod', event.target.value)
                  }
                >
                  <option>Kapıda ödeme</option>
                  <option>Havale / EFT</option>
                  <option>Kredi kartı</option>
                  <option>Ödeme bağlantısı</option>
                </select>
              </label>

              <label className={styles.convertFullField}>
                <span>Teslimat adresi</span>

                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    updateField('address', event.target.value)
                  }
                  placeholder="Müşterinin teslimat adresi"
                />
              </label>

              <label className={styles.convertFullField}>
                <span>Sipariş notu</span>

                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(event) =>
                    updateField('note', event.target.value)
                  }
                />
              </label>
            </div>
          </div>

          {error && <div className={styles.convertFormError}>{error}</div>}

          <footer className={styles.convertModalActions}>
            <button
              type="button"
              className={styles.convertCancelButton}
              onClick={onClose}
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className={styles.convertSubmitButton}
            >
              <span>✓</span>
              Siparişi oluştur
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
