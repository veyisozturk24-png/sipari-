import { apiFetch } from "@/lib/api";
import type { ApiProduct } from "./product-types";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID!;

export function fetchProducts(): Promise<ApiProduct[]> {
  return apiFetch<ApiProduct[]>(
    `/products?companyId=${COMPANY_ID}`,
  );
}