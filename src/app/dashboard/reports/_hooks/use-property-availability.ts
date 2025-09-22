// src/app/dashboard/reports/_hooks/use-property-availability.ts
"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getPropertyAvailabilityReport,
} from "@/lib/report-service";
import type { PropertyReport, PropertyReportData } from "@/types/report";

export interface UIPropertyAvailabilityParams {
  month: number; // 1-12
  year: number; // full year
  propertyId?: number;
  roomId?: number;
}

export interface UsePropertyAvailabilityParams extends Partial<UIPropertyAvailabilityParams> {}

export function usePropertyAvailability(initial?: UsePropertyAvailabilityParams) {
  const now = new Date();
  const [params, setParams] = useState<UIPropertyAvailabilityParams>({
    month: initial?.month ?? now.getMonth() + 1,
    year: initial?.year ?? now.getFullYear(),
    propertyId: initial?.propertyId,
    roomId: initial?.roomId,
  });
  const [data, setData] = useState<PropertyReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const session = useSession();
  const router = useRouter();

  const fetchData = async () => {
    // Wait for session to resolve to avoid false unauthenticated during refresh
    if (session.status === "loading") return;
    if (session.status === "unauthenticated") {
      router.push("/login");
      return;
    }
    const token = session.data?.user?.accessToken;
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const monthIso = `${params.year}-${String(params.month).padStart(2, "0")}-01`;
      const res = await getPropertyAvailabilityReport(
        { month: monthIso, propertyId: params.propertyId },
        token
      );
      setData(res);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to load availability";
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
  }, [params.month, params.year, params.propertyId, params.roomId, session.status]);

  const properties = useMemo(() => (data?.data ?? []).map((d) => d.property), [data]);
  const roomsByProperty = useMemo(() => {
    const map = new Map<number, PropertyReportData["rooms"]>();
    (data?.data ?? []).forEach((d) => {
      map.set(d.property.id, d.rooms);
    });
    return map;
  }, [data]);

  return {
    data,
    loading,
    error,
    params,
    setParams,
    refetch: fetchData,
    properties,
    roomsByProperty,
  };
}
