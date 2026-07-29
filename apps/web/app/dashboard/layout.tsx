"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSession } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/giris");
      return;
    }

    const timer = window.setTimeout(() => setReady(true), 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  return ready ? children : null;
}
