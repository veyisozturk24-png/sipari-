'use client';

import { FormEvent, useEffect, useState } from 'react';
import styles from './dashboard.module.css';

type NewOrderForm = {
  customer: string;
  phone: string;
  channel: string;
  productName: string;
  quantity: string;
  amount: string;
  address: string;
  note: string;
};

const emptyForm: NewOrderForm = {
  customer: '',
  phone: '',
  channel: 'WhatsApp',
  productName: '',
  quantity: '1',
  amount: '',
  address: '',
  note: '',
};

function createInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('');
}

function formatAmount(value: string) {
  const number = Number(value.replace(/[^\d]/g, ''));

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(number || 0);
}

export default function NewOrderButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<NewOrderForm>(emptyForm);
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
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', closeWithEscape);

    return () => {
      window.removeEventListener('keydown', closeWithEscape);
    };
  }, []);

  function updateField(
    field: keyof NewOrderForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (
      !form.customer.trim() ||
      !form.phone.trim() ||
      !form.productName.trim() ||
      !form.amount.trim()
    ) {
      setError('Müşteri, telefon, ürün ve tutar alanları zorunludur.');
      return;
    }

    const quantity = Math.max(1, Number(form.quantity) || 1);

    const order = {
      id: `#SP-${Date.now().toString().slice(-4)}`,
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      initials: createInitials(form.customer),
      channel: form.channel,
      product: `${quantity} ürün`,
      products: [`${form.productName.trim()} × ${quantity}`],
      amount: formatAmount(form.amount),
      status: 'Yeni',
      statusType: 'new',
      address: form.address.trim() || 'Adres henüz eklenmedi',
      note: form.note.trim() || 'Sipariş notu bulunmuyor.',
      time: 'Şimdi',
    };

    window.dispatchEvent(
      new CustomEvent('siparis:new-order', {
        detail: order,
      }),
    );

    setForm(emptyForm);
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={() => setIsOpen(true)}
      >
        <span>＋</span> Yeni sipariş
      </button>

      {isOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsOpen(false)}
        >
          <section
            className={styles.newOrderModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-order-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <span>YENİ KAYIT</span>
                <h2 id="new-order-title">Yeni sipariş oluştur</h2>
                <p>Müşteri ve sipariş bilgilerini ekle.</p>
              </div>

              <button
                type="button"
                aria-label="Formu kapat"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <form className={styles.orderForm} onSubmit={handleSubmit}>
              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>
                  <span>1</span>
                  <div>
                    <strong>Müşteri bilgileri</strong>
                    <small>Siparişi veren kişi</small>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <label>
                    <span>Ad soyad *</span>
                    <input
                      autoFocus
                      value={form.customer}
                      onChange={(event) =>
                        updateField('customer', event.target.value)
                      }
                      placeholder="Örn. Ayşe Yılmaz"
                    />
                  </label>

                  <label>
                    <span>Telefon *</span>
                    <input
                      value={form.phone}
                      onChange={(event) =>
                        updateField('phone', event.target.value)
                      }
                      placeholder="05xx xxx xx xx"
                    />
                  </label>

                  <label className={styles.fullField}>
                    <span>Satış kanalı</span>
                    <select
                      value={form.channel}
                      onChange={(event) =>
                        updateField('channel', event.target.value)
                      }
                    >
                      <option>WhatsApp</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                      <option>Web</option>
                      <option>Telefon</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>
                  <span>2</span>
                  <div>
                    <strong>Sipariş bilgileri</strong>
                    <small>Ürün, adet ve ödeme tutarı</small>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.fullField}>
                    <span>Ürün adı *</span>
                    <input
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
                      min="1"
                      type="number"
                      value={form.quantity}
                      onChange={(event) =>
                        updateField('quantity', event.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>Toplam tutar *</span>
                    <div className={styles.moneyInput}>
                      <span>₺</span>
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

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>
                  <span>3</span>
                  <div>
                    <strong>Teslimat bilgileri</strong>
                    <small>Adres ve özel notlar</small>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.fullField}>
                    <span>Teslimat adresi</span>
                    <textarea
                      rows={3}
                      value={form.address}
                      onChange={(event) =>
                        updateField('address', event.target.value)
                      }
                      placeholder="İlçe, şehir ve açık adres"
                    />
                  </label>

                  <label className={styles.fullField}>
                    <span>Sipariş notu</span>
                    <textarea
                      rows={3}
                      value={form.note}
                      onChange={(event) =>
                        updateField('note', event.target.value)
                      }
                      placeholder="Kargo, ödeme veya ürünle ilgili not..."
                    />
                  </label>
                </div>
              </div>

              {error && (
                <div className={styles.formError}>
                  <span>!</span>
                  {error}
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsOpen(false)}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  <span>＋</span>
                  Siparişi oluştur
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
