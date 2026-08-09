import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-violet-700 text-4xl font-black">
          ✓
        </div>

        <p className="mt-8 font-black text-orange-400">
          Başvurunuz alındı
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Siparİş pilot programına gösterdiğiniz ilgi için teşekkür ederiz.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
          İşletmenizi ve ihtiyacınızı değerlendireceğiz. Uygun olduğunda
          verdiğiniz iletişim bilgileri üzerinden size döneceğiz.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-white px-7 py-4 font-black text-slate-950"
          >
            Ana sayfaya dön
          </Link>

          <a
            href="mailto:veyisozturk24@gmail.com"
            className="rounded-xl border border-white/20 px-7 py-4 font-black text-white"
          >
            Bize ulaşın
          </a>
        </div>
      </div>
    </main>
  );
}
