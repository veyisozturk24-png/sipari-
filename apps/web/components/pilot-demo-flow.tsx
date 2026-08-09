'use client';

import { useState } from 'react';

const steps = [
  {
    time: '0–2 dk',
    label: 'İhtiyacı dinle',
    menu: 'Başlangıç',
    eyebrow: 'ÖNCE DİNLE',
    title: 'İşletmenin günlük akışını anla',
    description: 'Bu ilk iki dakikada paneli değil, müşterinin sorununu konuştur.',
    content: (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold text-slate-400">Sorulacak iki soru</p>
        <div className="mt-3 grid gap-2">
          <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold">Siparişleri en çok nereden alıyorsunuz?</p>
          <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold">En çok ne zaman sipariş kaçıyor veya karışıyor?</p>
        </div>
      </div>
    ),
    note: '“Önce mevcut yönteminizi anlamak istiyorum; size uymayan bir sistemi göstermeyeceğim.”',
  },
  {
    time: '2–5 dk',
    label: 'Genel bakış',
    menu: 'Genel Bakış',
    eyebrow: 'GENEL BAKIŞ',
    title: 'Günlük operasyon tek ekranda',
    description: 'Sipariş, stok ve kargoyu dağınık notlar yerine aynı çalışma alanında görün.',
    content: (
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Bekleyen sipariş', '8'], ['Hazırlanıyor', '4'], ['Kritik stok', '2 ürün']].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-400">{label}</p><strong className="mt-2 block text-xl">{value}</strong></div>
        ))}
      </div>
    ),
    note: '“Amacımız yeni iş çıkarmak değil, her gün zaten yaptığınız takibi düzenli hale getirmek.”',
  },
  {
    time: '5–8 dk',
    label: 'Müşteri ve ürün',
    menu: 'Müşteriler',
    eyebrow: 'MÜŞTERİ & ÜRÜN',
    title: 'Bilgi tekrar kaybolmaz',
    description: 'Müşteri geçmişi ve ürün stoğu sipariş oluştururken hazır olur.',
    content: (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-400">Müşteri profili</p><p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold">Duygu Y. <span className="float-right font-medium text-slate-500">3 sipariş</span></p><p className="mt-2 text-xs text-slate-500">Not: Kargo adresi kayıtlı</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-400">Ürünler</p><p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold">Siyah Elbise <span className="float-right text-emerald-600">● 12 stok</span></p><p className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold">Mavi Kot <span className="float-right text-emerald-600">● 8 stok</span></p></div>
      </div>
    ),
    note: '“Müşteri tekrar yazdığında önceki siparişleri ve kayıtlı adresi baştan aramazsınız.”',
  },
  {
    time: '8–11 dk',
    label: 'Sipariş oluştur',
    menu: 'Siparişler',
    eyebrow: 'YENİ SİPARİŞ',
    title: 'Bir konuşmayı düzenli kayda çevir',
    description: 'Müşteri, ürün, adet ve teslimat bilgisini tek formda tamamla.',
    content: (
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-orange-50 p-4"><p className="font-bold">Yeni sipariş taslağı</p><div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white p-3 text-xs"><span className="block text-slate-400">Müşteri</span><b>Duygu Y.</b></div><div className="rounded-xl bg-white p-3 text-xs"><span className="block text-slate-400">Ürün</span><b>Siyah Elbise</b></div><div className="rounded-xl bg-white p-3 text-xs"><span className="block text-slate-400">Adet</span><b>2</b></div></div><div className="mt-3 rounded-xl bg-gradient-to-r from-violet-700 to-orange-500 px-3 py-2.5 text-center text-sm font-bold text-white">Siparişi oluştur</div></div>
    ),
    note: '“Mesaj, not ve adres parçaları burada tek sipariş kaydına dönüşüyor.”',
  },
  {
    time: '11–15 dk',
    label: 'Kargo ve pilot',
    menu: 'Kargo',
    eyebrow: 'KARGO & PİLOT',
    title: 'Takip numarası siparişe bağlanır',
    description: 'İlk aşamada kargo bilgisini manuel kaydedip süreci görünür hale getiriyoruz.',
    content: (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 font-black text-emerald-700">✓</span><div><strong className="block text-sm">Yurtiçi Kargo · 123456789</strong><span className="text-xs text-emerald-700">Durum: Kargoya verildi</span></div></div>
    ),
    note: '“Pilot boyunca ilk ürünlerinizi, müşterilerinizi ve sipariş akışınızı birlikte kuruyoruz.”',
  },
];

export default function PilotDemoFlow() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = steps[selectedIndex];

  return (
    <section id="pilot-demo" className="bg-slate-100 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="font-black text-violet-700">Pilot demosu</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">15 dakikada ne göreceksiniz?</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Her adımı seçin; pilot görüşmesinde kullanacağımız örnek ekranı görün.</p></div>
          <p className="font-black text-violet-700">{String(selectedIndex + 1).padStart(2, '0')} / 05 · {selected.time}</p>
        </div>
        <div className="mt-10 grid gap-2 sm:grid-cols-5">
          {steps.map((step, index) => <button key={step.label} type="button" onClick={() => setSelectedIndex(index)} className={`rounded-2xl border p-4 text-left transition ${index === selectedIndex ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-lg shadow-violet-100' : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200'}`}><span className="text-xs font-black text-violet-700">{String(index + 1).padStart(2, '0')} · {step.time}</span><strong className="mt-2 block text-sm">{step.label}</strong></button>)}
        </div>
        <div className="mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div className="flex items-center gap-2 font-black"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-violet-700 text-white">S</span>Siparİş <span className="font-semibold text-slate-400">/ Örnek demo</span></div><span className="text-xs font-bold text-emerald-700">● Pilot gösterimi</span></div>
          <div className="grid md:grid-cols-[160px_1fr]"><aside className="flex gap-1 overflow-auto border-b border-slate-200 bg-white p-3 md:block md:border-b-0 md:border-r">{steps.map((step, index) => <span key={step.menu} className={`mb-1 block whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${index === selectedIndex ? 'bg-violet-100 text-violet-700' : 'text-slate-500'}`}>{step.menu}</span>)}</aside><div className="min-h-[335px] bg-slate-50 p-6 sm:p-8"><p className="text-xs font-black tracking-wider text-violet-700">{selected.eyebrow}</p><h3 className="mt-2 text-2xl font-black">{selected.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{selected.description}</p><div className="mt-5">{selected.content}</div><p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600"><b className="text-violet-700">Bu adımda:</b> {selected.note}</p></div></div>
        </div>
      </div>
    </section>
  );
}
