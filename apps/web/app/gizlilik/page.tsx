import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:py-20">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
        <Link href="/" className="text-sm font-bold text-violet-700 hover:text-violet-900">← Siparİş ana sayfa</Link>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-violet-700">Siparİş</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Gizlilik Politikası</h1>
        <p className="mt-4 text-sm text-slate-500">Son güncelleme: 30 Temmuz 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-900">Hizmetin kapsamı</h2>
            <p className="mt-3">Siparİş; işletmelerin müşteri, ürün, stok, sipariş ve kargo süreçlerini tek panelden yönetmesine yardımcı olur. Hizmeti kullanırken işletmeniz ve müşterilerinizle ilgili veriler sisteme girilebilir.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900">Güvenlik</h2>
            <p className="mt-3">Hesap erişimi parola ve oturum mekanizmalarıyla korunur. Erişimi yalnızca yetkili kullanıcılarınızla paylaşmalı, parolanızı gizli tutmalı ve şüpheli erişimleri gecikmeden bildirmelisiniz.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900">Çerezler ve teknik veriler</h2>
            <p className="mt-3">Hizmetin çalışması için oturum bilgileri tarayıcınızda saklanabilir. Performans, güvenlik ve hata takibi için sınırlı teknik bilgiler işlenebilir.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900">İletişim</h2>
            <p className="mt-3">Gizlilikle ilgili sorularınız için <a className="font-bold text-violet-700" href="mailto:veyisozturk24@gmail.com">veyisozturk24@gmail.com</a> adresinden Veyis Öztürk ile iletişime geçebilirsiniz. Kişisel verilerin işlenmesine ilişkin ayrıntılar için <Link href="/kvkk" className="font-bold text-violet-700">KVKK Aydınlatma Metni</Link>’ni inceleyin.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
