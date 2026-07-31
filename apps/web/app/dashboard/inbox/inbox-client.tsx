'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getActiveCompanyId } from '@/lib/auth';
import styles from './inbox.module.css';
import ConvertOrderModal from './convert-order-modal';

type Channel = 'WhatsApp' | 'Instagram' | 'Facebook';

type Message = {
  id: string;
  sender: 'customer' | 'business';
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  customerId: string;
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

type ApiConversation = {
  id: string;
  customer: { id: string; name: string; phone: string | null };
  channel: { name: string; platform: 'WHATSAPP' };
  messages: Array<{
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    text: string | null;
    sentAt: string | null;
    createdAt: string;
  }>;
  lastMessageAt: string | null;
};

type ApiChannel = {
  id: string;
  name: string;
  externalAccountId: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'ERROR';
};

const quickReplies = [
  'Evet, ürün stokta mevcut.',
  'Siparişinizi hemen oluşturabilirim.',
  'Kargonuz bugün teslim edilecek.',
];

export default function InboxClient() {
  const companyId = getActiveCompanyId();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<ApiChannel[]>([]);
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [displayName, setDisplayName] = useState('WhatsApp');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    async function loadConversations() {
      try {
        setIsLoading(true);
        const [data, configuredChannels] = await Promise.all([
          apiFetch<ApiConversation[]>(`/whatsapp/conversations?companyId=${companyId}`),
          apiFetch<ApiChannel[]>(`/whatsapp/channels?companyId=${companyId}`),
        ]);
        const mapped = data.map((conversation) => {
          const name = conversation.customer.name;
          const lastMessage = conversation.messages.at(-1);
          const lastMessageAt = conversation.lastMessageAt ?? lastMessage?.sentAt ?? lastMessage?.createdAt;

          return {
            id: conversation.id,
            customerId: conversation.customer.id,
            customer: name,
            initials: name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('tr-TR'),
            phone: conversation.customer.phone ?? 'Telefon bilgisi yok',
            channel: 'WhatsApp' as const,
            preview: lastMessage?.text ?? 'Medya veya sistem mesajı',
            time: lastMessageAt ? new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(lastMessageAt)) : '',
            unread: 0,
            online: false,
            messages: conversation.messages.map((item) => ({
              id: item.id,
              sender: item.direction === 'OUTBOUND' ? 'business' as const : 'customer' as const,
              text: item.text ?? 'Medya veya sistem mesajı',
              time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.sentAt ?? item.createdAt)),
            })),
          };
        });

        setConversations(mapped);
        setChannels(configuredChannels);
        setSelectedId((current) => current ?? mapped[0]?.id ?? null);
      } catch {
        setToast('WhatsApp konuşmaları yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadConversations();
  }, [companyId]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const displayConversation: Conversation = selectedConversation ?? {
    id: 'empty',
    customerId: '',
    customer: 'Henüz WhatsApp konuşması yok',
    initials: 'WA',
    phone: 'Meta bağlantısından sonra mesajlar burada görünür.',
    channel: 'WhatsApp',
    preview: '',
    time: '',
    unread: 0,
    online: false,
    messages: [],
  };

  function renderConnectionForm() {
    return (
      <form className={styles.connectionCard} onSubmit={configureWhatsAppChannel}>
        <div>
          <span className={styles.connectionIcon}>WA</span>
          <div>
            <strong>WhatsApp numarasını bağla</strong>
            <p>Meta’daki Phone Number ID değerini buraya yapıştır.</p>
          </div>
        </div>
        <label>
          Görünen kanal adı
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Örn. Siparİş test" />
        </label>
        <label>
          Phone Number ID
          <input required value={phoneNumberId} onChange={(event) => setPhoneNumberId(event.target.value)} placeholder="Meta’dan kopyalanan numara" inputMode="numeric" />
        </label>
        <button disabled={isConnecting} type="submit">{isConnecting ? 'Bağlanıyor...' : 'Test numarasını bağla'}</button>
      </form>
    );
  }

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

  function selectConversation(id: string) {
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

    setToast('Mesaj gönderme, Meta WhatsApp bağlantısı tamamlandığında açılacak.');
    setMessage('');
  }

  function convertToOrder() {
    if (selectedConversation) {
      setIsConvertModalOpen(true);
    }
  }

  async function configureWhatsAppChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!companyId || !phoneNumberId.trim()) {
      setToast('Meta’daki Phone Number ID alanını girmen gerekiyor.');
      return;
    }

    try {
      setIsConnecting(true);
      const channel = await apiFetch<ApiChannel>('/whatsapp/channels', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          phoneNumberId: phoneNumberId.trim(),
          displayName: displayName.trim() || 'WhatsApp',
        }),
      });

      setChannels((current) => [
        ...current.filter((item) => item.id !== channel.id),
        channel,
      ]);
      setPhoneNumberId('');
      setIsConnectionFormOpen(false);
      setToast('WhatsApp numarası bağlandı. Şimdi Meta webhook ayarına geçebiliriz.');
    } catch {
      setToast('WhatsApp numarası bağlanamadı. Oturumunu ve Meta’daki Phone Number ID değerini kontrol et.');
    } finally {
      setIsConnecting(false);
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

          <button type="button" onClick={() => setIsConnectionFormOpen((current) => !current)}>
            <i />
            {channels.length > 0 ? `${channels.length} kanal bağlı` : 'WhatsApp bağla'}
          </button>
        </header>

        <section className={styles.inbox}>
          <aside className={styles.conversationPanel}>
            <div className={styles.conversationHeader}>
              <div>
                <h2>Mesajlar</h2>
                <span>{conversations.length > 0 ? `${conversations.length} konuşma` : 'WhatsApp mesajlarını bağla'}</span>
              </div>

              <button type="button" aria-label="WhatsApp bağlantısı ekle" onClick={() => setIsConnectionFormOpen(true)}>＋</button>
            </div>

            {(isConnectionFormOpen || channels.length === 0) && (
              renderConnectionForm()
            )}

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
              {isLoading && <div className={styles.emptySearch}>Konuşmalar yükleniyor...</div>}

              {!isLoading && filteredConversations.map((conversation) => (
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

              {!isLoading && filteredConversations.length === 0 && (
                <div className={styles.emptySearch}>
                  Eşleşen konuşma bulunamadı.
                </div>
              )}
            </div>
          </aside>

          <section className={styles.chatPanel}>
            <div className={styles.mobileConnection}>
              {(isConnectionFormOpen || channels.length === 0) ? renderConnectionForm() : (
                <button
                  type="button"
                  className={styles.manageConnectionButton}
                  onClick={() => setIsConnectionFormOpen(true)}
                >
                  <span>✓</span>
                  WhatsApp bağlı
                  <small>Yönet</small>
                </button>
              )}
            </div>
            <header className={styles.chatHeader}>
              <div className={styles.chatCustomer}>
                <span>
                  {displayConversation.initials}
                  {displayConversation.online && <i />}
                </span>

                <div>
                  <strong>{displayConversation.customer}</strong>
                  <small>
                    {displayConversation.online
                      ? 'Şu anda çevrimiçi'
                      : displayConversation.phone}
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
                  disabled={!selectedConversation}
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

              {displayConversation.messages.map((item) => (
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

              {!selectedConversation && (
                <div className={styles.emptySearch}>WhatsApp numaranızı Meta üzerinden bağladığınızda müşterilerden gelen mesajlar burada görünecek.</div>
              )}
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
                {displayConversation.initials}
              </span>

              <h3>{displayConversation.customer}</h3>
              <p>{displayConversation.phone}</p>

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
                  <dd>{displayConversation.channel}</dd>
                </div>

                <div>
                  <dt>Telefon</dt>
                  <dd>{displayConversation.phone}</dd>
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
          customer: displayConversation.customer,
          customerId: displayConversation.customerId,
          phone: displayConversation.phone,
          initials: displayConversation.initials,
          channel: displayConversation.channel,
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
