// src/lib/report-service.ts
import { axiosInstance } from "@/lib/axios";
import type { SalesReport, PropertyReport } from "@/types/report";

export type SalesGroupBy = "property" | "transaction" | "user";
export type SalesSortBy = "date" | "total";

export interface GetSalesReportParams {
  groupBy: SalesGroupBy;
  sortBy?: SalesSortBy;
  sortOrder?: "asc" | "desc";
  startDate?: string; // ISO date e.g. 2025-09-01
  endDate?: string;   // ISO date e.g. 2025-09-30
  page?: number;
  take?: number;
}

// Generic response to support multiple groupings
export interface SalesReportResponse<T = any> {
  data: T[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalSales: number;
  };
}

export async function getSalesReport(
  params: GetSalesReportParams,
  accessToken: string
): Promise<SalesReportResponse> {
  const res = await axiosInstance.get<SalesReportResponse>("/reports/sales", {
    headers: { Authorization: `Bearer ${accessToken}` },
    params,
  });
  return res.data;
}

// ------------------------------
// Property Availability Report
// ------------------------------

export interface GetPropertyAvailabilityParams {
  // ISO date string pointing to any day in the target month, e.g. 2025-09-01
  month?: string;
  propertyId?: number;
}

export async function getPropertyAvailabilityReport(
  params: GetPropertyAvailabilityParams,
  accessToken: string
): Promise<PropertyReport> {
  const res = await axiosInstance.get<PropertyReport>("/reports/property", {
    headers: { Authorization: `Bearer ${accessToken}` },
    params,
  });
  return res.data;
}

