import { apiFetch } from "@/lib/api";
import { getActiveCompanyId } from "@/lib/auth";

export type DashboardData = {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    customers: number;
  };
  salesLast30Days: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
};

export function fetchDashboard(): Promise<DashboardData> {
  const companyId = getActiveCompanyId();

  return apiFetch<DashboardData>(`/dashboard?companyId=${companyId}`);
}
