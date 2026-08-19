'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getActiveCompanyId, getSession } from '@/lib/auth';
import styles from './inbox.module.css';
import ConvertOrderModal from './convert-order-modal';
import NewOrderButton from '../new-order-button';

type Channel = 'WhatsApp' | 'Instagram' | 'Facebook';
type ConnectableChannel = 'WHATSAPP' | 'INSTAGRAM';

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
  orders: Array<{ orderNumber: string; totalAmount: number; createdAt: string }>;
};

type ApiConversation = {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    orders: Array<{ orderNumber: string; totalAmount: number | string; createdAt: string }>;
  };
  channel: { name: string; platform: 'WHATSAPP' | 'INSTAGRAM' };
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
  platform: ConnectableChannel;
  externalAccountId: string | null;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
};

type SentMessage = {
  id: string;
  text: string | null;
  sentAt: string | null;
  createdAt: string;
};

const quickReplies = [
  'Evet, ürün stokta mevcut.',
  'Siparişinizi hemen oluşturabilirim.',
  'Kargonuz bugün teslim edilecek.',
];

export default function InboxClient() {
  const companyId = getActiveCompanyId();
  const user = getSession()?.user;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<ApiChannel[]>([]);
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false);
  const [connectionPlatform, setConnectionPlatform] = useState<ConnectableChannel>('WHATSAPP');
  const [channelIdentifier, setChannelIdentifier] = useState('');
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
        const [whatsAppConversations, whatsAppChannels, instagramConversations, instagramChannels] = await Promise.all([
          apiFetch<ApiConversation[]>(`/whatsapp/conversations?companyId=${companyId}`),
          apiFetch<ApiChannel[]>(`/whatsapp/channels?companyId=${companyId}`),
          apiFetch<ApiConversation[]>(`/instagram/conversations?companyId=${companyId}`),
          apiFetch<ApiChannel[]>(`/instagram/channels?companyId=${companyId}`),
        ]);
        const mapped = [...whatsAppConversations, ...instagramConversations].map((conversation) => {
          const name = conversation.customer.name;
          const lastMessage = conversation.messages.at(-1);
          const lastMessageAt = conversation.lastMessageAt ?? lastMessage?.sentAt ?? lastMessage?.createdAt;

          return {
            id: conversation.id,
            customerId: conversation.customer.id,
            customer: name,
            initials: name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('tr-TR'),
            phone: conversation.customer.phone ?? 'Telefon bilgisi yok',
            channel: conversation.channel.platform === 'INSTAGRAM' ? 'Instagram' as const : 'WhatsApp' as const,
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
            orders: conversation.customer.orders.map((order) => ({
              orderNumber: order.orderNumber,
              totalAmount: Number(order.totalAmount),
              createdAt: order.createdAt,
            })),
          };
        });

        setConversations(mapped);
        setChannels([...whatsAppChannels, ...instagramChannels]);
        setSelectedId((current) => current ?? mapped[0]?.id ?? null);
      } catch {
        setToast('Kanal konuşmaları yüklenemedi.');
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
    orders: [],
  };
  const customerTotal = displayConversation.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const latestCustomerOrder = displayConversation.orders[0] ?? null;
  const userInitials = (user?.name ?? 'K').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('tr-TR');

  function renderConnectionForm() {
    return (
      <form className={styles.connectionCard} onSubmit={configureChannel}>
        <div>
          <span className={styles.connectionIcon}>{connectionPlatform === 'INSTAGRAM' ? 'IG' : 'WA'}</span>
          <div>
            <strong>{connectionPlatform === 'INSTAGRAM' ? 'Instagram hesabını bağla' : 'WhatsApp numarasını bağla'}</strong>
            <p>{connectionPlatform === 'INSTAGRAM' ? 'Meta’daki Instagram Account ID değerini buraya yapıştır.' : 'Meta’daki Phone Number ID değerini buraya yapıştır.'}</p>
          </div>
        </div>
        <label>
          Kanal türü
          <select
            value={connectionPlatform}
            onChange={(event) => {
              const platform = event.target.value as ConnectableChannel;
              setConnectionPlatform(platform);
              setDisplayName(platform === 'INSTAGRAM' ? 'Instagram' : 'WhatsApp');
              setChannelIdentifier('');
            }}
          >
            <option value="WHATSAPP">WhatsApp</option>
            <option value="INSTAGRAM">Instagram</option>
          </select>
        </label>
        <label>
          Görünen kanal adı
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Örn. Siparİş test" />
        </label>
        <label>
          {connectionPlatform === 'INSTAGRAM' ? 'Instagram Account ID' : 'Phone Number ID'}
          <input required value={channelIdentifier} onChange={(event) => setChannelIdentifier(event.target.value)} placeholder="Meta’dan kopyalanan kimlik" inputMode="numeric" />
        </label>
        <button disabled={isConnecting} type="submit">{isConnecting ? 'Bağlanıyor...' : connectionPlatform === 'INSTAGRAM' ? 'Instagram hesabını bağla' : 'Test numarasını bağla'}</button>
      </form>
    );
  }

  function renderConnectedChannels() {
    return (
      <div className={styles.connectedChannelCard}>
        <div className={styles.connectedChannelHeading}>
          <span className={styles.connectionIcon}>✓</span>
          <div>
            <strong>{channels.length} kanal bağlı</strong>
            <p>Bağlı kanallardaki müşteri konuşmaları burada görünür.</p>
          </div>
          <span className={styles.connectedDot} />
        </div>
        {channels.map((channel) => (
          <div key={channel.id} className={styles.channelIdentifier}>
            <span>{channel.name}</span>
            <strong>{channel.platform === 'INSTAGRAM' ? 'Instagram Account ID' : 'Phone Number ID'}</strong>
            <code>{channel.externalAccountId || 'Tanımlanmadı'}</code>
          </div>
        ))}
        <button type="button" onClick={() => setIsConnectionFormOpen(true)}>
          Kimliği değiştir veya yeni numara ekle
        </button>
      </div>
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

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = message.trim();

    if (!text || !selectedConversation || !companyId) {
      if (!selectedConversation) {
        setToast('Mesaj göndermek için önce bir konuşma seç.');
      }
      return;
    }

    try {
      const sent = await apiFetch<SentMessage>(selectedConversation.channel === 'Instagram' ? '/instagram/messages' : '/whatsapp/messages', {
        method: 'POST',
        body: JSON.stringify({ companyId, conversationId: selectedConversation.id, text }),
      });
      const sentAt = sent.sentAt ?? sent.createdAt;

      setConversations((current) => current.map((conversation) => (
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              preview: sent.text ?? text,
              time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(sentAt)),
              messages: [...conversation.messages, {
                id: sent.id,
                sender: 'business',
                text: sent.text ?? text,
                time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(sentAt)),
              }],
            }
          : conversation
      )));
      setMessage('');
    } catch {
      setToast(`${selectedConversation.channel} mesajı gönderilemedi. Railway’deki erişim anahtarını ve Meta ayarlarını kontrol et.`);
    }
  }

  function convertToOrder() {
    if (selectedConversation) {
      setIsConvertModalOpen(true);
    }
  }

  async function configureChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!companyId || !channelIdentifier.trim()) {
      setToast(connectionPlatform === 'INSTAGRAM' ? 'Meta’daki Instagram Account ID alanını girmen gerekiyor.' : 'Meta’daki Phone Number ID alanını girmen gerekiyor.');
      return;
    }

    try {
      setIsConnecting(true);
      const isInstagram = connectionPlatform === 'INSTAGRAM';
      const channel = await apiFetch<ApiChannel>(isInstagram ? '/instagram/channels' : '/whatsapp/channels', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          ...(isInstagram ? { instagramAccountId: channelIdentifier.trim() } : { phoneNumberId: channelIdentifier.trim() }),
          displayName: displayName.trim() || (isInstagram ? 'Instagram' : 'WhatsApp'),
        }),
      });

      setChannels((current) => [
        ...current.filter((item) => item.id !== channel.id),
        channel,
      ]);
      setChannelIdentifier('');
      setIsConnectionFormOpen(false);
      setToast(isInstagram ? 'Instagram hesabı doğrulanıp bağlandı.' : 'WhatsApp numarası bağlandı.');
    } catch {
      setToast(connectionPlatform === 'INSTAGRAM' ? 'Instagram hesabı bağlanamadı. Railway erişim anahtarını ve Instagram Account ID değerini kontrol et.' : 'WhatsApp numarası bağlanamadı. Oturumunu ve Meta’daki Phone Number ID değerini kontrol et.');
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
          <span>{userInitials}</span>

          <div>
            <strong>{user?.companyMemberships[0]?.company.name ?? 'İşletme'}</strong>
            <small>{user?.companyMemberships[0]?.role ?? 'Kullanıcı'} hesabı</small>
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
          </Link>

          <Link href="/dashboard/orders">
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

          <Link href="/dashboard/inbox">
            <span>⌁</span>
            Kanallar
          </Link>

          <Link href="/dashboard/marketplaces">
            <span>🛍</span>
            Pazaryerleri
          </Link>
        </nav>

        <div className={styles.profile}>
          <span>{userInitials}</span>

          <div>
            <strong>{user?.name ?? 'Kullanıcı'}</strong>
            <small>{user?.email ?? ''}</small>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div>
            <h1>Gelen Kutusu</h1>
            <p>Tüm satış kanallarındaki müşteri konuşmalarını yönet.</p>
          </div>

          <div className={styles.pageActions}>
            <NewOrderButton />
            <button type="button" onClick={() => setIsConnectionFormOpen((current) => !current)}>
              <i />
              {channels.length > 0 ? `${channels.length} kanal bağlı` : 'Kanal bağla'}
            </button>
          </div>
        </header>

        <section className={styles.inbox}>
          <aside className={styles.conversationPanel}>
            <div className={styles.conversationHeader}>
              <div>
                <h2>Mesajlar</h2>
                <span>{conversations.length > 0 ? `${conversations.length} konuşma` : 'Mesaj kanalını bağla'}</span>
              </div>

              <button type="button" aria-label="Kanal bağlantısı ekle" onClick={() => setIsConnectionFormOpen(true)}>＋</button>
            </div>

            {isConnectionFormOpen || channels.length === 0
              ? renderConnectionForm()
              : renderConnectedChannels()}

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
              {isConnectionFormOpen || channels.length === 0
                ? renderConnectionForm()
                : renderConnectedChannels()}
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
                <div className={styles.manualOrderHint}>
                  <span>✦</span>
                  <div>
                    <strong>Mesajdan manuel sipariş kaydı</strong>
                    <p>Meta bağlantısı olmadan da DM’yi telefonundan yanıtlayıp, sağ üstteki <b>Yeni sipariş</b> ile müşteri, ürün ve teslimat bilgilerini Siparİş’e kaydedebilirsin.</p>
                  </div>
                </div>
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

              </dl>
            </section>

            <section className={styles.infoSection}>
              <div className={styles.infoHeading}>
                <h4>Sipariş özeti</h4>
              </div>

              <div className={styles.orderSummary}>
                <div>
                  <span>Toplam sipariş</span>
                  <strong>{displayConversation.orders.length}</strong>
                </div>

                <div>
                  <span>Toplam harcama</span>
                  <strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(customerTotal)}</strong>
                </div>
              </div>

              {latestCustomerOrder ? (
                <div className={styles.lastOrder}>
                  <div>
                    <span>{latestCustomerOrder.orderNumber}</span>
                    <small>{new Date(latestCustomerOrder.createdAt).toLocaleDateString('tr-TR')}</small>
                  </div>
                  <strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(latestCustomerOrder.totalAmount)}</strong>
                </div>
              ) : (
                <p className={styles.noOrders}>Bu müşteri için henüz sipariş yok.</p>
              )}
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
