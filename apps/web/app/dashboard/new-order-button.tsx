'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import styles from './dashboard.module.css';
import { createOrder as createOrderApi } from './order-api';

const COMPANY_ID = 'e630b46e-358f-4d9b-9f8e-62c40829b580';
const API_URL = 'http://localhost:3001';

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  price: string | number;
  stock: number;
};

type ApiOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
};

type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
  customerNote: string | null;
  internalNote: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingCity: string | null;
  shippingDistrict: string | null;
  shippingAddress: string | null;
  createdAt: string;
  customer: Customer | null;
  items: ApiOrderItem[];
};

type NewOrderForm = {
  customerId: string;
  productId: string;
  quantity: string;
  shippingAmount: string;
  discountAmount: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingAddress: string;
  customerNote: string;
};

const emptyForm: NewOrderForm = {
  customerId: '',
  productId: '',
  quantity: '1',
  shippingAmount: '0',
  discountAmount: '0',
  shippingCity: '',
  shippingDistrict: '',
  shippingAddress: '',
  customerNote: '',
};

function createInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toLocaleUpperCase('tr-TR'),
    )
    .join('');
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function getErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body
  ) {
    const message = body.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}

export default function NewOrderButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] =
    useState<NewOrderForm>(emptyForm);

  const [customers, setCustomers] = useState<Customer[]>(
    [],
  );
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState('');

  const selectedCustomer =
    customers.find(
      (customer) => customer.id === form.customerId,
    ) ?? null;

  const selectedProduct =
    products.find(
      (product) => product.id === form.productId,
    ) ?? null;

  const quantity = Math.max(
    1,
    Number.parseInt(form.quantity, 10) || 1,
  );

  const shippingAmount = Math.max(
    0,
    Number.parseInt(form.shippingAmount, 10) || 0,
  );

  const discountAmount = Math.max(
    0,
    Number.parseInt(form.discountAmount, 10) || 0,
  );

  const subtotal = useMemo(() => {
    if (!selectedProduct) {
      return 0;
    }

    return Number(selectedProduct.price) * quantity;
  }, [quantity, selectedProduct]);

  const totalAmount = Math.max(
    0,
    subtotal + shippingAmount - discountAmount,
  );

  useEffect(() => {
    document.body.style.overflow = isOpen
      ? 'hidden'
      : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', closeWithEscape);

    return () => {
      window.removeEventListener(
        'keydown',
        closeWithEscape,
      );
    };
  }, [isSubmitting]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isActive = true;

    async function loadOptions() {
      setIsLoadingOptions(true);
      setError('');

      try {
        const [customersResponse, productsResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/customers?companyId=${COMPANY_ID}`,
              {
                cache: 'no-store',
              },
            ),
            fetch(
              `${API_URL}/products?companyId=${COMPANY_ID}`,
              {
                cache: 'no-store',
              },
            ),
          ]);

        const customersBody =
          await customersResponse.json().catch(() => null);
        const productsBody =
          await productsResponse.json().catch(() => null);

        if (!customersResponse.ok) {
          throw new Error(
            getErrorMessage(
              customersBody,
              'Müşteriler alınamadı.',
            ),
          );
        }

        if (!productsResponse.ok) {
          throw new Error(
            getErrorMessage(
              productsBody,
              'Ürünler alınamadı.',
            ),
          );
        }

        if (!isActive) {
          return;
        }

        setCustomers(
          Array.isArray(customersBody)
            ? customersBody
            : [],
        );

        setProducts(
          Array.isArray(productsBody)
            ? productsBody
            : [],
        );
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Form verileri yüklenemedi.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      isActive = false;
    };
  }, [isOpen]);

  function updateField(
    field: keyof NewOrderForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    setError('');
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError('');

    if (!selectedCustomer) {
      setError('Lütfen bir müşteri seçin.');
      return;
    }

    if (!selectedProduct) {
      setError('Lütfen bir ürün seçin.');
      return;
    }

    if (quantity > selectedProduct.stock) {
      setError(
        `Yetersiz stok. Kullanılabilir stok: ${selectedProduct.stock}`,
      );
      return;
    }

    if (discountAmount > subtotal + shippingAmount) {
      setError(
        'İndirim tutarı sipariş toplamından büyük olamaz.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const createdOrder = await createOrderApi({
  customerId: selectedCustomer.id,
  items: [
    {
      productId: selectedProduct.id,
      quantity,
    },
  ],
  shippingAmount,
  discountAmount,
  customerNote:
    form.customerNote.trim() || undefined,
  shippingName: selectedCustomer.name,
  shippingPhone:
    selectedCustomer.phone || undefined,
  shippingCity:
    form.shippingCity.trim() || undefined,
  shippingDistrict:
    form.shippingDistrict.trim() || undefined,
  shippingAddress:
    form.shippingAddress.trim() || undefined,
});
      const productCount = createdOrder.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );

      const address = [
        createdOrder.shippingDistrict,
        createdOrder.shippingCity,
        createdOrder.shippingAddress,
      ]
        .filter(Boolean)
        .join(', ');

      window.dispatchEvent(
        new CustomEvent('siparis:new-order', {
          detail: {
            id: createdOrder.orderNumber,
            customer:
              createdOrder.customer?.name ||
              createdOrder.shippingName ||
              selectedCustomer.name,
            phone:
              createdOrder.customer?.phone ||
              createdOrder.shippingPhone ||
              'Telefon bilgisi yok',
            initials:
              createInitials(
                createdOrder.customer?.name ||
                  createdOrder.shippingName ||
                  selectedCustomer.name,
              ) || 'M',
            channel: 'Panel',
            product: `${productCount} ürün`,
            products: createdOrder.items.map(
              (item) =>
                `${item.productName} × ${item.quantity}`,
            ),
            amount: formatCurrency(
              createdOrder.totalAmount,
            ),
            status: 'Yeni',
            statusType: 'new',
            address:
              address || 'Adres henüz eklenmedi',
            note:
              createdOrder.customerNote ||
              createdOrder.internalNote ||
              'Sipariş notu bulunmuyor.',
            time: 'Şimdi',
          },
        }),
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === selectedProduct.id
            ? {
                ...product,
                stock:
                  product.stock - quantity,
              }
            : product,
        ),
      );

      setForm(emptyForm);
      setIsOpen(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Sipariş oluşturulamadı.',
      );
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={closeModal}
        >
          <section
            className={styles.newOrderModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-order-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className={styles.modalHeader}>
              <div>
                <span>YENİ KAYIT</span>
                <h2 id="new-order-title">
                  Yeni sipariş oluştur
                </h2>
                <p>
                  Müşteri ve ürünü kayıtlı
                  verilerden seç.
                </p>
              </div>

              <button
                type="button"
                aria-label="Formu kapat"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form
              className={styles.orderForm}
              onSubmit={handleSubmit}
            >
              <div className={styles.formSection}>
                <div
                  className={styles.formSectionTitle}
                >
                  <span>1</span>

                  <div>
                    <strong>Müşteri bilgileri</strong>
                    <small>
                      Kayıtlı müşterilerden seç
                    </small>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <label
                    className={styles.fullField}
                  >
                    <span>Müşteri *</span>

                    <select
                      autoFocus
                      value={form.customerId}
                      disabled={
                        isLoadingOptions ||
                        isSubmitting
                      }
                      onChange={(event) =>
                        updateField(
                          'customerId',
                          event.target.value,
                        )
                      }
                    >
                      <option value="">
                        Müşteri seçin
                      </option>

                      {customers.map((customer) => (
                        <option
                          key={customer.id}
                          value={customer.id}
                        >
                          {customer.name}
                          {customer.phone
                            ? ` · ${customer.phone}`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className={styles.formSection}>
                <div
                  className={styles.formSectionTitle}
                >
                  <span>2</span>

                  <div>
                    <strong>Sipariş bilgileri</strong>
                    <small>
                      Ürün, adet ve tutarlar
                    </small>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <label
                    className={styles.fullField}
                  >
                    <span>Ürün *</span>

                    <select
                      value={form.productId}
                      disabled={
                        isLoadingOptions ||
                        isSubmitting
                      }
                      onChange={(event) =>
                        updateField(
                          'productId',
                          event.target.value,
                        )
                      }
                    >
                      <option value="">
                        Ürün seçin
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                          disabled={product.stock < 1}
                        >
                          {product.name} ·{' '}
                          {formatCurrency(
                            product.price,
                          )}{' '}
                          · Stok: {product.stock}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Adet</span>

                    <input
                      type="number"
                      min="1"
                      max={
                        selectedProduct?.stock ?? 1
                      }
                      value={form.quantity}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateField(
                          'quantity',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>Kargo tutarı</span>

                    <div
                      className={styles.moneyInput}
                    >
                      <span>₺</span>

                      <input
                        type="number"
                        min="0"
                        value={form.shippingAmount}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateField(
                            'shippingAmount',
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </label>

                  <label>
                    <span>İndirim</span>

                    <div
                      className={styles.moneyInput}
                    >
                      <span>₺</span>

                      <input
                        type="number"
                        min="0"
                        value={form.discountAmount}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateField(
                            'discountAmount',
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </label>

                  <label>
                    <span>Mevcut stok</span>

                    <input
                      readOnly
                      value={
                        selectedProduct
                          ? `${selectedProduct.stock} adet`
                          : 'Ürün seçilmedi'
                      }
                    />
                  </label>

                  <label>
                    <span>Birim fiyat</span>

                    <input
                      readOnly
                      value={
                        selectedProduct
                          ? formatCurrency(
                              selectedProduct.price,
                            )
                          : formatCurrency(0)
                      }
                    />
                  </label>

                  <label>
                    <span>Ara toplam</span>

                    <input
                      readOnly
                      value={formatCurrency(subtotal)}
                    />
                  </label>

                  <label>
                    <span>Genel toplam</span>

                    <input
                      readOnly
                      value={formatCurrency(
                        totalAmount,
                      )}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.formSection}>
                <div
                  className={styles.formSectionTitle}
                >
                  <span>3</span>

                  <div>
                    <strong>
                      Teslimat bilgileri
                    </strong>
                    <small>
                      Adres ve sipariş notu
                    </small>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <label>
                    <span>Şehir</span>

                    <input
                      value={form.shippingCity}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateField(
                          'shippingCity',
                          event.target.value,
                        )
                      }
                      placeholder="İstanbul"
                    />
                  </label>

                  <label>
                    <span>İlçe</span>

                    <input
                      value={form.shippingDistrict}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateField(
                          'shippingDistrict',
                          event.target.value,
                        )
                      }
                      placeholder="Kadıköy"
                    />
                  </label>

                  <label
                    className={styles.fullField}
                  >
                    <span>Açık adres</span>

                    <textarea
                      rows={3}
                      value={form.shippingAddress}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateField(
                          'shippingAddress',
                          event.target.value,
                        )
                      }
                      placeholder="Mahalle, sokak ve bina bilgileri"
                    />
                  </label>

                  <label
                    className={styles.fullField}
                  >
                    <span>Sipariş notu</span>

                    <textarea
                      rows={3}
                      value={form.customerNote}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateField(
                          'customerNote',
                          event.target.value,
                        )
                      }
                      placeholder="Kargo veya ürünle ilgili not..."
                    />
                  </label>
                </div>
              </div>

              {isLoadingOptions && (
                <div className={styles.formError}>
                  Müşteri ve ürünler yükleniyor...
                </div>
              )}

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
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={
                    isLoadingOptions ||
                    isSubmitting
                  }
                >
                  <span>
                    {isSubmitting ? '…' : '＋'}
                  </span>

                  {isSubmitting
                    ? 'Oluşturuluyor'
                    : 'Siparişi oluştur'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
