// src/app/dashboard/reports/_hooks/use-sales-report.ts
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getSalesReport, type GetSalesReportParams, type SalesReportResponse } from "@/lib/report-service";

export function useSalesReport(initialParams: GetSalesReportParams) {
  const [params, setParams] = useState<GetSalesReportParams>(initialParams);
  const [data, setData] = useState<SalesReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const router = useRouter();

  const fetchData = async () => {
    // Avoid acting while session is still resolving
    if (session.status === "loading") return;
    // If truly unauthenticated, redirect
    if (session.status === "unauthenticated") {
      router.push("/login");
      return;
    }
    const token = session.data?.user?.accessToken;
    if (!token) {
      // Session exists but token missing: show error but don't force redirect
      setError("Authentication required");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getSalesReport(params, token);
      setData(res);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to load report";
      setError(message);
      if (err?.response?.status === 401) {
        router.push("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params), session.status]);

  return {
    data,
    loading,
    error,
    params,
    setParams,
    refetch: fetchData,
  };
}
