"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { saveSession, type AuthSession } from "@/lib/auth";

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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="text-sm font-black text-violet-700">SİPARİŞ</p>
        <h1 className="mt-2 text-3xl font-black">{isRegistering ? "İşletmeni oluştur" : "Tekrar hoş geldin"}</h1>
        <p className="mt-3 text-slate-600">{isRegistering ? "İlk kullanıcı hesabın işletme sahibi olur." : "Sipariş operasyonuna kaldığın yerden devam et."}</p>
        {isRegistering && <><label className="mt-6 block text-sm font-bold">Ad soyad<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label><label className="mt-4 block text-sm font-bold">İşletme adı<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label></>}
        <label className="mt-4 block text-sm font-bold">E-posta<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
        <label className="mt-4 block text-sm font-bold">Parola<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        <button disabled={saving} className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:opacity-60">{saving ? "İşleniyor..." : isRegistering ? "Hesap oluştur" : "Giriş yap"}</button>
        <button type="button" onClick={() => { setIsRegistering((value) => !value); setError(""); }} className="mt-4 w-full text-sm font-bold text-violet-700">{isRegistering ? "Zaten hesabın var mı? Giriş yap" : "Yeni misin? İşletme oluştur"}</button>
      </form>
    </main>
  );
}
