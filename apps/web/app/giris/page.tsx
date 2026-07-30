"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { saveSession, type AuthSession } from "@/lib/auth";
import AppIcon from "@/components/app-icon";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/auth/${isRegistering ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegistering ? { name, companyName, email, password } : { email, password },
        ),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
        throw new Error(message ?? "Giriş yapılamadı.");
      }

      saveSession(body as AuthSession);
      router.replace("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Giriş yapılamadı.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(249,115,22,0.18),transparent_29%),radial-gradient(circle_at_84%_12%,rgba(124,58,237,0.18),transparent_33%)]" />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-[30px] border border-white bg-white/95 p-8 shadow-2xl shadow-violet-200/50 backdrop-blur sm:p-10">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-violet-700 text-lg font-black text-white shadow-lg shadow-violet-200">S</span>
          <p className="text-sm font-black tracking-wide text-violet-700">SİPARİŞ</p>
        </div>
        <h1 className="mt-2 text-3xl font-black">{isRegistering ? "İşletmeni oluştur" : "Tekrar hoş geldin"}</h1>
        <p className="mt-3 text-slate-600">{isRegistering ? "İlk kullanıcı hesabın işletme sahibi olur." : "Sipariş operasyonuna kaldığın yerden devam et."}</p>
        {isRegistering && <><label className="mt-6 block text-sm font-bold">Ad soyad<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100" /></label><label className="mt-4 block text-sm font-bold">İşletme adı<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100" /></label></>}
        <label className="mt-4 block text-sm font-bold">E-posta<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100" /></label>
        <label className="mt-4 block text-sm font-bold">Parola<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100" /></label>
        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        <button disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 font-bold text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:transform-none disabled:opacity-60">{saving ? "İşleniyor..." : <>{isRegistering ? "Hesap oluştur" : "Giriş yap"}<AppIcon name="arrow-right" size={18} /></>}</button>
        <button type="button" onClick={() => { setIsRegistering((value) => !value); setError(""); }} className="mt-4 w-full text-sm font-bold text-violet-700">{isRegistering ? "Zaten hesabın var mı? Giriş yap" : "Yeni misin? İşletme oluştur"}</button>
      </form>
    </main>
  );
}
