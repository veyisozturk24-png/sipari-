import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Siparİş | Sosyal Medya Sipariş Yönetimi",
    template: "%s | Siparİş",
  },
  description:
    "WhatsApp, Instagram, Facebook ve web sitesi siparişlerinizi tek panelden yönetin. Stok, müşteri ve kargo süreçlerinizi düzenleyin.",
  keywords: [
    "sipariş yönetimi",
    "WhatsApp sipariş",
    "Instagram sipariş",
    "sosyal medya satış",
    "stok yönetimi",
    "Siparİş",
  ],
  authors: [{ name: "Siparİş" }],
  creator: "Siparİş",
  applicationName: "Siparİş",
  openGraph: {
    title: "Siparİş | Siparişlerinizi Tek Panelden Yönetin",
    description:
      "WhatsApp, Instagram, Facebook ve web sitesi siparişlerinizi tek panelde yönetin.",
    type: "website",
    locale: "tr_TR",
    siteName: "Siparİş",
  },
  twitter: {
    card: "summary_large_image",
    title: "Siparİş | Sosyal Medya Sipariş Yönetimi",
    description:
      "Mesajdan siparişe, siparişten teslimata kadar tüm süreci tek panelden yönetin.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}