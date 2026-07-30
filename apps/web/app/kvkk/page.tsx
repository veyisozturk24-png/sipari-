import Link from "next/link";

const updatedAt = "30 Temmuz 2026";

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:py-20">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
        <Link href="/" className="text-sm font-bold text-violet-700 hover:text-violet-900">← Siparİş ana sayfa</Link>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-violet-700">KVKK</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Aydınlatma Metni</h1>
        <p className="mt-4 text-sm text-slate-500">Son güncelleme: {updatedAt}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Veri sorumlusu</h2>
            <p className="mt-3">6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında kişisel verileriniz, veri sorumlusu sıfatıyla Veyis Öztürk tarafından Siparİş hizmeti çerçevesinde işlenebilir.</p>
            <p className="mt-3">İletişim: <a className="font-bold text-violet-700" href="mailto:veyisozturk24@gmail.com">veyisozturk24@gmail.com</a><br />Adres: Semazen Sokak Fullada Sitesi B Blok Daire 1, Maltepe / İstanbul</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. İşlenen veriler ve amaçlar</h2>
            <p className="mt-3">Hesap oluşturma, pilot başvuru, destek ve hizmet kullanımı sırasında ad soyad, işletme adı, e-posta, telefon, sipariş, müşteri, ürün, stok, teslimat ve kullanım bilgileri işlenebilir. Bu veriler; hesabın oluşturulması, hizmetin sunulması, sipariş ve stok operasyonlarının yürütülmesi, destek sağlanması, güvenliğin korunması ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla kullanılır.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. Toplama yöntemi ve hukuki sebep</h2>
            <p className="mt-3">Veriler; web formları, hesap oluşturma ekranları, hizmet içi işlemler ve ileride bağlanabilecek iletişim kanalları üzerinden elektronik ortamda elde edilir. Veriler, sözleşmenin kurulması veya ifası, hukuki yükümlülüklerin yerine getirilmesi, meşru menfaat ve gerektiği hâllerde açık rıza hukuki sebeplerine dayanılarak işlenir.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Aktarım ve saklama</h2>
            <p className="mt-3">Veriler, hizmetin çalışması için gerekli bulut altyapısı ve teknik hizmet sağlayıcılarıyla, yetkili kamu kurumlarıyla ve yasal zorunluluk hâllerinde ilgili taraflarla; KVKK’daki aktarım şartlarına uygun olarak paylaşılabilir. Veriler, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen saklama süreleri kadar muhafaza edilir.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">5. Haklarınız ve başvuru</h2>
            <p className="mt-3">KVKK’nın 11. maddesi kapsamında verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme veya yok edilmesini isteme, aktarımları öğrenme ve zararın giderilmesini talep etme haklarına sahipsiniz. Taleplerinizi kimliğinizi doğrulayacak bilgi ve belgelerle <a className="font-bold text-violet-700" href="mailto:veyisozturk24@gmail.com">veyisozturk24@gmail.com</a> adresine iletebilirsiniz.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
