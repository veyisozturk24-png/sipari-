
import AppIcon, { type AppIconName } from "@/components/app-icon";
import PilotDemoFlow from "@/components/pilot-demo-flow";

const features = [
  {
    title: "Tüm satış operasyonu tek panelde",
    description:
      "Manuel girilen ve bağlanan kanallardan gelen siparişleri aynı çalışma alanında yönetin.",
    icon: "inbox" as AppIconName,
    color: "bg-violet-100 text-violet-700",
  },
  {
    title: "Konuşmadan sipariş oluşturun",
    description:
      "Müşteriyle yazışırken ürün, beden, renk ve adet bilgilerini siparişe dönüştürün.",
    icon: "sparkles" as AppIconName,
    color: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    title: "Stok hatalarını azaltın",
    description:
      "Siparişleri ortak stok yapısına bağlayarak çift satış riskini azaltın.",
    icon: "stock" as AppIconName,
    color: "bg-orange-100 text-orange-700",
  },
  {
    title: "Kargo sürecini takip edin",
    description:
      "Hazırlanan, paketlenen ve kargoya verilen siparişleri tek akışta görün.",
    icon: "truck" as AppIconName,
    color: "bg-sky-100 text-sky-700",
  },
  {
    title: "Müşteri geçmişini görün",
    description:
      "Konuşmaları, siparişleri ve müşteri notlarını tek profilde görüntüleyin.",
    icon: "customers" as AppIconName,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Hızlı sipariş kaydı",
    description:
      "Müşteri, ürün, adet ve teslimat bilgisini tek akışta siparişe dönüştürün.",
    icon: "chart" as AppIconName,
    color: "bg-rose-100 text-rose-700",
  },
];

const steps = [
  "Ürünlerinizi ve müşterilerinizi ekleyin.",
  "Siparişlerinizi tek gelen kutusunda toplayın.",
  "Konuşmadan sipariş oluşturun.",
  "Stok, ödeme ve kargo durumunu yönetin.",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-violet-700 text-lg font-black text-white shadow-lg shadow-violet-300/60">
              S
            </span>

            <span className="text-xl font-black">Siparİş</span>
          </a>

          <nav className="hidden gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#ozellikler" className="hover:text-slate-950">
              Özellikler
            </a>

            <a href="#nasil-calisir" className="hover:text-slate-950">
              Nasıl çalışır?
            </a>

            <a href="#pilot" className="hover:text-slate-950">
              Pilot program
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/giris"
              className="hidden rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 sm:inline-flex"
            >
              Giriş yap
            </a>
            <a
              href="#pilot"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Pilot kullanıcı olun
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_16%_14%,rgba(249,115,22,0.19),transparent_30%),radial-gradient(circle_at_78%_5%,rgba(109,40,217,0.2),transparent_38%),radial-gradient(circle_at_68%_65%,rgba(236,72,153,0.1),transparent_28%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm backdrop-blur">
              <AppIcon name="sparkles" size={16} /> Sosyal ticaret yönetim platformu
            </p>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Sipariş kaçırmayın.
              <span className="block bg-gradient-to-r from-violet-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
                Satışınızı tek panelden yönetin.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Sosyal medya ve web üzerinden aldığınız siparişleri; müşteri,
              stok ve kargo süreçleriyle tek çalışma alanında yönetin.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#pilot"
              className="rounded-xl bg-slate-950 px-7 py-4 text-center font-bold text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Ücretsiz pilot başvurusu
              </a>

              <a
                href="#pilot-demo"
              className="rounded-xl border border-slate-300 bg-white/80 px-7 py-4 text-center font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white"
              >
                Demo ekranını inceleyin
              </a>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-600">
              Zaten hesabın var mı?{" "}
              <a href="/giris" className="font-bold text-violet-700 hover:text-violet-900">
                Giriş yap →
              </a>
            </p>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Pilot aşamasında WhatsApp ve Instagram bağlantılarını işletmenizin
              hesabına göre birlikte kuruyoruz. Bağlantı tamamlanana kadar
              sipariş ve kargo akışını panelden hemen kullanabilirsiniz.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-slate-600">
              {['Ücretsiz kurulum desteği', 'Kredi kartı gerekmez', 'İlk işletmelere özel koşullar'].map((item) => <span key={item} className="inline-flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700"><AppIcon name="check" size={13} strokeWidth={2.5} /></span>{item}</span>)}
            </div>
          </div>

          <div
            id="demo"
            className="relative rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-2xl shadow-violet-200/50 backdrop-blur"
          >
            <div className="overflow-hidden rounded-2xl bg-slate-950">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
                <div>
                  <p className="text-sm text-slate-400">Siparİş</p>
                  <p className="font-bold">Örnek çalışma alanı</p>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Demo görünümü
                </span>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-[180px_1fr]">
                <div className="space-y-2">
                  {[
                    ["Müşteri mesajı", "WhatsApp"],
                    ["Yeni talep", "Instagram"],
                    ["Panel siparişi", "Web"],
                  ].map(([name, channel], index) => (
                    <div
                      key={name}
                      className={`rounded-xl p-3 ${
                        index === 0
                          ? "bg-white text-slate-950"
                          : "bg-slate-900 text-slate-300"
                      }`}
                    >
                      <p className="text-sm font-bold">{name}</p>
                      <p className="mt-1 text-xs opacity-70">{channel}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-white p-5 text-slate-950">
                  <p className="text-sm font-bold">Yeni müşteri talebi</p>

                  <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm">
                    Siyah elbisenin 38 bedeninden iki tane istiyorum.
                  </div>

                  <div className="mt-5 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-orange-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-violet-700">
                      <AppIcon name="sparkles" size={15} /> Sipariş taslağı
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-400">Ürün</p>
                        <p className="mt-1 text-sm font-black">Siyah Elbise</p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-400">Beden</p>
                        <p className="mt-1 text-sm font-black">38</p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-400">Adet</p>
                        <p className="mt-1 text-sm font-black">2</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-700 to-orange-500 px-4 py-3 text-sm font-black text-white"
                    >
                      Taslağı incele
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PilotDemoFlow />

      <section id="ozellikler" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="font-black text-violet-700">Tek çalışma alanı</p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Mesajdan teslimata kadar tüm süreç
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Dağınık mesajlar, Excel dosyaları ve unutulan siparişler yerine
              bütün satış operasyonunuzu tek panelden yönetin.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:bg-white hover:shadow-xl hover:shadow-violet-100/60"
              >
                <div className="flex items-center justify-between">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${feature.color}`}><AppIcon name={feature.icon} size={22} /></span>
                  <span className="text-sm font-black text-orange-500">{String(index + 1).padStart(2, "0")}</span>
                </div>

                <h3 className="mt-6 text-xl font-black">{feature.title}</h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2">
          <div>
            <p className="font-black text-violet-700">Basit başlangıç</p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Dört adımda satış operasyonunuzu düzenleyin
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Karmaşık kurulumlara ve uzun eğitimlere ihtiyaç duymadan
              işletmenizi Siparİş’e taşıyın.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-700 to-fuchsia-600 text-lg font-black text-white shadow-lg shadow-violet-200">
                  0{index + 1}
                </span>

                <p className="font-bold text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pilot" className="px-6 pb-24">
        <div className="mx-auto max-w-7xl rounded-[36px] bg-slate-950 px-7 py-14 text-white sm:px-12 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_430px] lg:items-center">
            <div>
              <p className="font-black text-orange-400">
                İlk pilot işletmelerimizi seçiyoruz
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Siparişlerinizi daha düzenli yönetmeye başlayın.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                İhtiyacınızı birlikte değerlendirelim. Uygun işletmelerle
                kurulum, test ve geri bildirim sürecini birebir yürütüyoruz.
              </p>

              <div className="mt-8 space-y-3 text-sm text-slate-300">
                <p>✓ Ücretsiz ihtiyaç analizi</p>
                <p>✓ Ürün, müşteri ve sipariş kurulumu desteği</p>
                <p>✓ WhatsApp / Instagram bağlantısı için teknik yönlendirme</p>
              </div>
            </div>

            <form
              action="https://api.web3forms.com/submit"
              method="POST"
              className="rounded-3xl bg-white p-6 text-slate-950"
            >
              <input
                type="hidden"
                name="access_key"
                value="ba7e1332-15f0-4609-987c-e72a8f73882d"
              />

              <input
                type="hidden"
                name="subject"
                value="Yeni Siparİş Pilot Başvurusu"
              />

              <input
                type="hidden"
                name="from_name"
                value="Siparİş Web Sitesi"
              />
              <input
                type="hidden"
                name="redirect"
                value="https://www.siparisyonetim.com/tesekkur"
              />
              <input
                type="checkbox"
                name="botcheck"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <h3 className="text-xl font-black">Pilot başvuru formu</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Bilgilerinizi bırakın, işletmenizi birlikte değerlendirelim.
              </p>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold">Adınız</span>

                  <input
                    required
                    type="text"
                    name="name"
                    placeholder="Adınız ve soyadınız"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">İşletme adı</span>

                  <input
                    required
                    type="text"
                    name="business"
                    placeholder="Mağazanızın adı"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">Telefon</span>

                  <input
                    required
                    type="tel"
                    name="phone"
                    placeholder="05xx xxx xx xx"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">E-posta</span>

                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="ornek@isletme.com"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">
                    Sipariş aldığınız kanal
                  </span>

                  <select
                    required
                    name="sales_channel"
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="" disabled>
                      Kanal seçin
                    </option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Web sitesi">Web sitesi</option>
                    <option value="Birden fazla kanal">
                      Birden fazla kanal
                    </option>
                    <option value="Henüz başlamadım">Henüz başlamadım</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-bold">
                    Günlük ortalama sipariş
                  </span>

                  <select
                    required
                    name="daily_orders"
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="" disabled>
                      Sipariş aralığını seçin
                    </option>
                    <option value="1-10">1–10 sipariş</option>
                    <option value="11-30">11–30 sipariş</option>
                    <option value="31-100">31–100 sipariş</option>
                    <option value="100+">100’den fazla</option>
                  </select>
                </label>

                <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  <input required type="checkbox" name="kvkk_notice_read" className="mt-1 h-4 w-4 accent-violet-700" />
                  <span>
                    <a href="/kvkk" target="_blank" className="font-bold text-violet-700 underline">KVKK Aydınlatma Metni</a>
                    {"’ni okudum; başvurumun değerlendirilmesi kapsamında bilgilerimin işlenmesi hakkında bilgilendirildim."}
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  <input type="checkbox" name="contact_permission" className="mt-1 h-4 w-4 accent-violet-700" />
                  <span>Başvurumla ilgili telefon veya e-posta yoluyla benimle iletişime geçilmesini kabul ediyorum.</span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-violet-700 to-orange-500 px-5 py-4 font-black text-white"
                >
                  Pilot programa başvur
                </button>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Başvuru ücretsizdir. Kredi kartı bilgisi istenmez.
              </p>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-violet-700 font-black text-white">
                S
              </span>

              <span className="text-lg font-black">Siparİş</span>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Mesajdan siparişe, siparişten teslimata.
            </p>
          </div>

          <div className="text-sm text-slate-500 md:text-right">
            <a
              href="mailto:veyisozturk24@gmail.com"
              className="font-bold text-slate-700 hover:text-violet-700"
            >
              veyisozturk24@gmail.com
            </a>

            <div className="mt-3 flex justify-start gap-4 font-semibold md:justify-end">
              <a href="/kvkk" className="hover:text-violet-700">KVKK Aydınlatma</a>
              <a href="/gizlilik" className="hover:text-violet-700">Gizlilik</a>
            </div>

            <p className="mt-3">© 2026 Siparİş · Veyis Öztürk</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
