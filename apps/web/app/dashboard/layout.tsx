"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSession } from "@/lib/auth";
import MobileNavigation from "./mobile-navigation";
import styles from "./mobile-navigation.module.css";

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

  return ready ? <><div className={styles.page}>{children}</div><MobileNavigation /></> : null;
}
