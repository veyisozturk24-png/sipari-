'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './inbox.module.css';
import ConvertOrderModal from './convert-order-modal';

type Channel = 'WhatsApp' | 'Instagram' | 'Facebook';

type Message = {
  id: number;
  sender: 'customer' | 'business';
  text: string;
  time: string;
};

type Conversation = {
  id: number;
  customer: string;
  initials: string;
  phone: string;
  channel: Channel;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: 1,
    customer: 'Ayşe Yılmaz',
    initials: 'AY',
    phone: '0555 321 45 67',
    channel: 'WhatsApp',
    preview: 'Siyah sweatshirt stokta var mı?',
    time: '10:42',
    unread: 2,
    online: true,
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Merhaba, siyah sweatshirt stokta var mı?',
        time: '10:38',
      },
      {
        id: 2,
        sender: 'business',
        text: 'Merhaba Ayşe Hanım, evet stokta mevcut.',
        time: '10:39',
      },
      {
        id: 3,
        sender: 'customer',
        text: 'M beden istiyorum. İstanbul Kadıköy’e gönderim olur mu?',
        time: '10:41',
      },
      {
        id: 4,
        sender: 'customer',
        text: 'Bir tane sipariş vermek istiyorum.',
        time: '10:42',
      },
    ],
  },
  {
    id: 2,
    customer: 'Mehmet Kaya',
    initials: 'MK',
    phone: '0532 440 18 22',
    channel: 'Instagram',
    preview: 'Kapıda ödeme seçeneğiniz var mı?',
    time: '09:28',
    unread: 1,
    online: false,
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Merhaba, slim fit kot pantolonun 32 bedeni mevcut mu?',
        time: '09:20',
      },
      {
        id: 2,
        sender: 'business',
        text: 'Merhaba, evet 32 beden stokta bulunuyor.',
        time: '09:23',
      },
      {
        id: 3,
        sender: 'customer',
        text: 'Kapıda ödeme seçeneğiniz var mı?',
        time: '09:28',
      },
    ],
  },
  {
    id: 3,
    customer: 'Selin Demir',
    initials: 'SD',
    phone: '0544 771 29 10',
    channel: 'WhatsApp',
    preview: 'Kargo takip numarasını alabilir miyim?',
    time: 'Dün',
    unread: 0,
    online: true,
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Siparişim kargoya verildi mi?',
        time: '16:10',
      },
      {
        id: 2,
        sender: 'business',
        text: 'Evet, siparişiniz bugün kargoya verildi.',
        time: '16:14',
      },
      {
        id: 3,
        sender: 'customer',
        text: 'Kargo takip numarasını alabilir miyim?',
        time: '16:18',
      },
    ],
  },
  {
    id: 4,
    customer: 'Can Öztürk',
    initials: 'CÖ',
    phone: '0507 615 90 31',
    channel: 'Facebook',
    preview: 'Teşekkür ederim, ürün elime ulaştı.',
    time: 'Dün',
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Teşekkür ederim, ürün elime ulaştı.',
        time: '14:07',
      },
      {
        id: 2,
        sender: 'business',
        text: 'Güzel günlerde kullanın. Bizi tercih ettiğiniz için teşekkür ederiz.',
        time: '14:10',
      },
    ],
  },
];

const quickReplies = [
  'Evet, ürün stokta mevcut.',
  'Siparişinizi hemen oluşturabilirim.',
  'Kargonuz bugün teslim edilecek.',
];

export default function InboxClient() {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0];

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      `${conversation.customer} ${conversation.preview} ${conversation.channel}`
        .toLocaleLowerCase('tr-TR')
        .includes(query),
    );
  }, [conversations, search]);

  function selectConversation(id: number) {
    setSelectedId(id);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              unread: 0,
            }
          : conversation,
      ),
    );
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = message.trim();

    if (!text) {
      return;
    }

    const now = new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedId
          ? {
              ...conversation,
              preview: text,
              time: now,
              messages: [
                ...conversation.messages,
                {
                  id: Date.now(),
                  sender: 'business',
                  text,
                  time: now,
                },
              ],
            }
          : conversation,
      ),
    );

    setMessage('');
  }

  function convertToOrder() {
    setIsConvertModalOpen(true);
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

          <Link href="/dashboard/inbox" className={styles.active}>
            <span>💬</span>
            Gelen Kutusu
            <b>3</b>
          </Link>

          <Link href="/dashboard">
            <span>▣</span>
            Siparişler
          </Link>

          <Link href="/dashboard/products">
            <span>◇</span>
            Ürünler
          </Link>

          <Link href="/dashboard/customers">
            <span>◉</span>
            Müşteriler
          </Link>

          <Link href="/dashboard/products">
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
            <h1>Gelen Kutusu</h1>
            <p>Tüm satış kanallarındaki müşteri konuşmalarını yönet.</p>
          </div>

          <button type="button">
            <i />
            Tüm kanallar aktif
          </button>
        </header>

        <section className={styles.inbox}>
          <aside className={styles.conversationPanel}>
            <div className={styles.conversationHeader}>
              <div>
                <h2>Mesajlar</h2>
                <span>3 okunmamış konuşma</span>
              </div>

              <button type="button">＋</button>
            </div>

            <div className={styles.search}>
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Müşteri veya mesaj ara..."
              />
            </div>

            <div className={styles.filters}>
              <button type="button" className={styles.filterActive}>
                Tümü
              </button>
              <button type="button">Okunmamış</button>
              <button type="button">WhatsApp</button>
            </div>

            <div className={styles.conversationList}>
              {filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={
                    selectedId === conversation.id
                      ? styles.selectedConversation
                      : ''
                  }
                  onClick={() => selectConversation(conversation.id)}
                >
                  <div className={styles.avatar}>
                    {conversation.initials}
                    {conversation.online && <i />}
                  </div>

                  <div className={styles.conversationBody}>
                    <div>
                      <strong>{conversation.customer}</strong>
                      <time>{conversation.time}</time>
                    </div>

                    <div>
                      <span>{conversation.preview}</span>

                      {conversation.unread > 0 && (
                        <b>{conversation.unread}</b>
                      )}
                    </div>

                    <small
                      className={
                        styles[
                          conversation.channel
                            .toLocaleLowerCase('tr-TR')
                            .replace('ı', 'i')
                        ]
                      }
                    >
                      {conversation.channel}
                    </small>
                  </div>
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <div className={styles.emptySearch}>
                  Eşleşen konuşma bulunamadı.
                </div>
              )}
            </div>
          </aside>

          <section className={styles.chatPanel}>
            <header className={styles.chatHeader}>
              <div className={styles.chatCustomer}>
                <span>
                  {selectedConversation.initials}
                  {selectedConversation.online && <i />}
                </span>

                <div>
                  <strong>{selectedConversation.customer}</strong>
                  <small>
                    {selectedConversation.online
                      ? 'Şu anda çevrimiçi'
                      : selectedConversation.phone}
                  </small>
                </div>
              </div>

              <div className={styles.chatActions}>
                <button type="button" aria-label="Ara">
                  ☎
                </button>

                <button type="button" aria-label="Müşteri bilgileri">
                  ⓘ
                </button>

                <button
                  type="button"
                  className={styles.convertButton}
                  onClick={convertToOrder}
                >
                  <span>＋</span>
                  Siparişe dönüştür
                </button>
              </div>
            </header>

            <div className={styles.messages}>
              <div className={styles.dayDivider}>
                <span>Bugün</span>
              </div>

              {selectedConversation.messages.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.sender === 'business'
                      ? styles.outgoing
                      : styles.incoming
                  }
                >
                  <div>
                    <p>{item.text}</p>
                    <time>{item.time}</time>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.quickReplies}>
              {quickReplies.map((reply) => (
                <button
                  type="button"
                  key={reply}
                  onClick={() => setMessage(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>

            <form className={styles.messageForm} onSubmit={sendMessage}>
              <button type="button" aria-label="Dosya ekle">
                ＋
              </button>

              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Mesajınızı yazın..."
              />

              <button type="button" aria-label="Emoji">
                ☺
              </button>

              <button
                type="submit"
                className={styles.sendButton}
                aria-label="Mesaj gönder"
              >
                ➤
              </button>
            </form>
          </section>

          <aside className={styles.customerPanel}>
            <div className={styles.customerCard}>
              <span className={styles.largeAvatar}>
                {selectedConversation.initials}
              </span>

              <h3>{selectedConversation.customer}</h3>
              <p>{selectedConversation.phone}</p>

              <div className={styles.customerButtons}>
                <button type="button">☎</button>
                <button type="button">✉</button>
                <button type="button">⋯</button>
              </div>
            </div>

            <section className={styles.infoSection}>
              <div className={styles.infoHeading}>
                <h4>Müşteri bilgileri</h4>
                <button type="button">Düzenle</button>
              </div>

              <dl>
                <div>
                  <dt>Kanal</dt>
                  <dd>{selectedConversation.channel}</dd>
                </div>

                <div>
                  <dt>Telefon</dt>
                  <dd>{selectedConversation.phone}</dd>
                </div>

                <div>
                  <dt>Konum</dt>
                  <dd>İstanbul, Türkiye</dd>
                </div>
              </dl>
            </section>

            <section className={styles.infoSection}>
              <div className={styles.infoHeading}>
                <h4>Sipariş özeti</h4>
                <button type="button">Tümünü gör</button>
              </div>

              <div className={styles.orderSummary}>
                <div>
                  <span>Toplam sipariş</span>
                  <strong>3</strong>
                </div>

                <div>
                  <span>Toplam harcama</span>
                  <strong>₺3.480</strong>
                </div>
              </div>

              <div className={styles.lastOrder}>
                <div>
                  <span>#SP-1048</span>
                  <small>Bugün</small>
                </div>

                <strong>₺1.240</strong>
              </div>
            </section>

            <section className={styles.infoSection}>
              <div className={styles.infoHeading}>
                <h4>Etiketler</h4>
                <button type="button">＋</button>
              </div>

              <div className={styles.tags}>
                <span>VIP müşteri</span>
                <span>WhatsApp</span>
              </div>
            </section>
          </aside>
        </section>
      </main>

      <ConvertOrderModal
        customer={{
          customer: selectedConversation.customer,
          phone: selectedConversation.phone,
          initials: selectedConversation.initials,
          channel: selectedConversation.channel,
        }}
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
      />

      {toast && (
        <div className={styles.toast}>
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
