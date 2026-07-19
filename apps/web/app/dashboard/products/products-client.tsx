'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiRequest, COMPANY_ID } from '@/lib/api';
import type { ApiProduct } from '@/types/api-product';
import styles from './products.module.css';

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  criticalStock: number;
  status: 'active' | 'passive';
  emoji: string;
};

type ProductForm = {
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
  criticalStock: string;
  emoji: string;
};

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  category: 'Tişört',
  price: '',
  stock: '',
  criticalStock: '5',
  emoji: '📦',
};

function mapApiProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category || 'Genel',
    price: Number(product.price),
    stock: product.stock,
    criticalStock: product.criticalStock,
    status: product.status === 'ACTIVE' ? 'active' : 'passive',
    emoji: product.emoji || '📦',
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadProducts() {
      if (!COMPANY_ID) {
        setError('NEXT_PUBLIC_COMPANY_ID tanımlı değil.');
        setIsLoading(false);
        return;
      }

      try {
        setError('');

        const data = await apiRequest<ApiProduct[]>(
          `/products?companyId=${encodeURIComponent(COMPANY_ID)}`,
        );

        setProducts(data.map(mapApiProduct));
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Ürünler yüklenemedi.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast('');
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        `${product.name} ${product.sku} ${product.category}`
          .toLocaleLowerCase('tr-TR')
          .includes(query);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'critical' &&
          product.stock > 0 &&
          product.stock <= product.criticalStock) ||
        (filter === 'out' && product.stock === 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const statistics = useMemo(() => {
    const totalStock = products.reduce(
      (total, product) => total + product.stock,
      0,
    );

    const critical = products.filter(
      (product) =>
        product.stock > 0 && product.stock <= product.criticalStock,
    ).length;

    const outOfStock = products.filter(
      (product) => product.stock === 0,
    ).length;

    const stockValue = products.reduce(
      (total, product) => total + product.stock * product.price,
      0,
    );

    return {
      totalProducts: products.length,
      totalStock,
      critical,
      outOfStock,
      stockValue,
    };
  }, [products]);

  async function updateStock(
    productId: string,
    amount: number,
  ) {
    const currentProduct = products.find(
      (product) => product.id === productId,
    );

    if (!currentProduct) {
      return;
    }

    const nextStock = Math.max(
      0,
      currentProduct.stock + amount,
    );

    try {
      const updated = await apiRequest<ApiProduct>(
        `/products/${productId}?companyId=${encodeURIComponent(COMPANY_ID)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            stock: nextStock,
            status: nextStock === 0 ? 'PASSIVE' : 'ACTIVE',
          }),
        },
      );

      const mappedProduct = mapApiProduct(updated);

      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? mappedProduct : product,
        ),
      );

      setToast(
        `${mappedProduct.name} stoğu ${mappedProduct.stock} olarak güncellendi.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Stok güncellenemedi.',
      );
    }
  }

  async function toggleStatus(productId: string) {
    const currentProduct = products.find(
      (product) => product.id === productId,
    );

    if (!currentProduct) {
      return;
    }

    const nextStatus =
      currentProduct.status === 'active'
        ? 'PASSIVE'
        : 'ACTIVE';

    try {
      const updated = await apiRequest<ApiProduct>(
        `/products/${productId}?companyId=${encodeURIComponent(COMPANY_ID)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextStatus,
          }),
        },
      );

      const mappedProduct = mapApiProduct(updated);

      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? mappedProduct : product,
        ),
      );

      setToast(
        `${mappedProduct.name} ${
          mappedProduct.status === 'active'
            ? 'satışa açıldı'
            : 'satışa kapatıldı'
        }.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Ürün durumu güncellenemedi.',
      );
    }
  }

  function updateField(field: keyof ProductForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createProduct(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError('');

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.price.trim()
    ) {
      setError('Ürün adı, stok kodu ve satış fiyatı zorunludur.');
      return;
    }

    if (!COMPANY_ID) {
      setError('NEXT_PUBLIC_COMPANY_ID tanımlı değil.');
      return;
    }

    const price = Math.max(0, Number(form.price) || 0);
    const stock = Math.max(0, Number(form.stock) || 0);

    try {
      const created = await apiRequest<ApiProduct>('/products', {
        method: 'POST',
        body: JSON.stringify({
          companyId: COMPANY_ID,
          name: form.name.trim(),
          sku: form.sku.trim().toLocaleUpperCase('tr-TR'),
          description: form.category
            ? `Kategori: ${form.category}`
            : undefined,
          category: form.category,
          criticalStock: Math.max(
            0,
            Number(form.criticalStock) || 0,
          ),
          emoji: form.emoji.trim() || '📦',
          price,
          stock,
        }),
      });

      const newProduct = mapApiProduct(created);

      setProducts((current) => [
        newProduct,
        ...current,
      ]);

      setForm(emptyForm);
      setIsModalOpen(false);
      setToast(`${newProduct.name} ürün listesine eklendi.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Ürün kaydedilemedi.',
      );
    }
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>S</span>

          <span>
            Sipar<span>İş</span>
          </span>
        </Link>

        <div className={styles.workspace}>
          <span>VM</span>

          <div>
            <strong>Veyis Moda</strong>
            <small>Yönetici hesabı</small>
          </div>
        </div>

        <nav className={styles.nav}>
          <p>MENÜ</p>

          <Link href="/dashboard">
            <span>▦</span>
            Genel Bakış
          </Link>

          <Link href="/dashboard/inbox">
            <span>💬</span>
            Gelen Kutusu
            <b>3</b>
          </Link>

          <Link href="/dashboard">
            <span>▣</span>
            Siparişler
          </Link>

          <Link
            href="/dashboard/products"
            className={styles.active}
          >
            <span>◇</span>
            Ürünler
          </Link>

          <Link href="/dashboard/customers">
            <span>◉</span>
            Müşteriler
          </Link>

          <Link
            href="/dashboard/products"
            className={styles.stockLink}
          >
            <span>▤</span>
            Stok Yönetimi
          </Link>

          <Link href="/dashboard/shipping">
            <span>🚚</span>
            Kargo Merkezi
          </Link>

          <p>YÖNETİM</p>

          <a href="#">
            <span>⌁</span>
            Kanallar
          </a>

          <a href="#">
            <span>⚙</span>
            Ayarlar
          </a>
        </nav>

        <div className={styles.profile}>
          <span>VÖ</span>

          <div>
            <strong>Veyis Öztürk</strong>
            <small>veyis@siparis.is</small>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div>
            <span>ÜRÜN YÖNETİMİ</span>
            <h1>Ürünler ve Stok</h1>
            <p>
              Ürünlerini, fiyatlarını ve stok seviyelerini tek
              ekrandan yönet.
            </p>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            <span>＋</span>
            Yeni ürün
          </button>
        </header>

        <section className={styles.statGrid}>
          <article>
            <div className={styles.statIcon}>◇</div>

            <div>
              <span>Toplam ürün</span>
              <strong>{statistics.totalProducts}</strong>
              <small>Ürün kataloğu</small>
            </div>
          </article>

          <article>
            <div className={styles.statIcon}>▤</div>

            <div>
              <span>Toplam stok</span>
              <strong>{statistics.totalStock}</strong>
              <small>Satılabilir adet</small>
            </div>
          </article>

          <article>
            <div className={`${styles.statIcon} ${styles.warning}`}>
              !
            </div>

            <div>
              <span>Kritik stok</span>
              <strong>{statistics.critical}</strong>
              <small>Takip gerektiriyor</small>
            </div>
          </article>

          <article>
            <div className={`${styles.statIcon} ${styles.danger}`}>
              ×
            </div>

            <div>
              <span>Tükenen ürün</span>
              <strong>{statistics.outOfStock}</strong>
              <small>Satışa kapalı</small>
            </div>
          </article>

          <article>
            <div className={`${styles.statIcon} ${styles.value}`}>
              ₺
            </div>

            <div>
              <span>Stok değeri</span>
              <strong>
                {formatCurrency(statistics.stockValue)}
              </strong>
              <small>Tahmini satış değeri</small>
            </div>
          </article>
        </section>

        <section className={styles.productCard}>
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Ürün, kategori veya stok kodu ara..."
              />
            </div>

            <div className={styles.filters}>
              <button
                type="button"
                className={
                  filter === 'all' ? styles.activeFilter : ''
                }
                onClick={() => setFilter('all')}
              >
                Tümü
              </button>

              <button
                type="button"
                className={
                  filter === 'critical'
                    ? styles.activeFilter
                    : ''
                }
                onClick={() => setFilter('critical')}
              >
                Kritik stok
              </button>

              <button
                type="button"
                className={
                  filter === 'out' ? styles.activeFilter : ''
                }
                onClick={() => setFilter('out')}
              >
                Tükenenler
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>ÜRÜN</th>
                  <th>KATEGORİ</th>
                  <th>FİYAT</th>
                  <th>STOK</th>
                  <th>DURUM</th>
                  <th>STOK İŞLEMİ</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const isCritical =
                    product.stock > 0 &&
                    product.stock <= product.criticalStock;

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className={styles.productInfo}>
                          <span>{product.emoji}</span>

                          <div>
                            <strong>{product.name}</strong>
                            <small>{product.sku}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={styles.category}>
                          {product.category}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(product.price)}
                        </strong>
                      </td>

                      <td>
                        <div className={styles.stockCell}>
                          <strong
                            className={
                              product.stock === 0
                                ? styles.stockOut
                                : isCritical
                                  ? styles.stockCritical
                                  : ''
                            }
                          >
                            {product.stock}
                          </strong>

                          <small>
                            Kritik: {product.criticalStock}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            product.status === 'active'
                              ? styles.activeStatus
                              : styles.passiveStatus
                          }
                        >
                          <i />
                          {product.status === 'active'
                            ? 'Satışta'
                            : 'Pasif'}
                        </span>
                      </td>

                      <td>
                        <div className={styles.stockActions}>
                          <button
                            type="button"
                            onClick={() =>
                              updateStock(product.id, -1)
                            }
                            disabled={product.stock === 0}
                            aria-label="Stok azalt"
                          >
                            −
                          </button>

                          <span>{product.stock}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateStock(product.id, 1)
                            }
                            aria-label="Stok artır"
                          >
                            ＋
                          </button>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={styles.moreButton}
                          onClick={() =>
                            toggleStatus(product.id)
                          }
                          title={
                            product.status === 'active'
                              ? 'Satışa kapat'
                              : 'Satışa aç'
                          }
                        >
                          ⋯
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className={styles.emptyState}>
                <span>📦</span>
                <strong>Ürün bulunamadı</strong>
                <p>
                  Arama veya filtre seçimini değiştirerek tekrar
                  dene.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsModalOpen(false)}
        >
          <section
            className={styles.productModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-product-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <span>YENİ KAYIT</span>
                <h2 id="new-product-title">Yeni ürün ekle</h2>
                <p>
                  Ürün bilgilerini ve başlangıç stok seviyesini
                  gir.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Formu kapat"
              >
                ×
              </button>
            </header>

            <form
              className={styles.productForm}
              onSubmit={createProduct}
            >
              <div className={styles.formGrid}>
                <label className={styles.fullField}>
                  <span>Ürün adı *</span>

                  <input
                    autoFocus
                    value={form.name}
                    onChange={(event) =>
                      updateField('name', event.target.value)
                    }
                    placeholder="Örn. Oversize siyah sweatshirt"
                  />
                </label>

                <label>
                  <span>Stok kodu *</span>

                  <input
                    value={form.sku}
                    onChange={(event) =>
                      updateField('sku', event.target.value)
                    }
                    placeholder="SWT-SYH-001"
                  />
                </label>

                <label>
                  <span>Kategori</span>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateField('category', event.target.value)
                    }
                  >
                    <option>Tişört</option>
                    <option>Sweatshirt</option>
                    <option>Pantolon</option>
                    <option>Dış Giyim</option>
                    <option>Aksesuar</option>
                    <option>Ayakkabı</option>
                    <option>Diğer</option>
                  </select>
                </label>

                <label>
                  <span>Satış fiyatı *</span>

                  <div className={styles.moneyInput}>
                    <b>₺</b>

                    <input
                      inputMode="numeric"
                      value={form.price}
                      onChange={(event) =>
                        updateField('price', event.target.value)
                      }
                      placeholder="1250"
                    />
                  </div>
                </label>

                <label>
                  <span>Başlangıç stoğu</span>

                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) =>
                      updateField('stock', event.target.value)
                    }
                    placeholder="10"
                  />
                </label>

                <label>
                  <span>Kritik stok seviyesi</span>

                  <input
                    type="number"
                    min="0"
                    value={form.criticalStock}
                    onChange={(event) =>
                      updateField(
                        'criticalStock',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Ürün simgesi</span>

                  <select
                    value={form.emoji}
                    onChange={(event) =>
                      updateField('emoji', event.target.value)
                    }
                  >
                    <option>📦</option>
                    <option>👕</option>
                    <option>👖</option>
                    <option>🧥</option>
                    <option>👗</option>
                    <option>👜</option>
                    <option>👟</option>
                  </select>
                </label>
              </div>

              {error && (
                <div className={styles.formError}>
                  <span>!</span>
                  {error}
                </div>
              )}

              <footer className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  <span>＋</span>
                  Ürünü kaydet
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className={styles.toast} role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
