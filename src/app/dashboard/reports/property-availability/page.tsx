"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { usePropertyAvailability } from "@/app/dashboard/reports/_hooks/use-property-availability";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { PropertyReportData } from "@/types/report";

export default function PropertyAvailabilityReportPage() {
  const { data, loading, error, params, setParams, refetch, properties, roomsByProperty } = usePropertyAvailability();

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return [now - 1, now, now + 1];
  }, []);

  const selectedRooms: PropertyReportData[] = useMemo(() => {
    if (!data?.data) return [];
    if (params.roomId) {
      return data.data
        .map((p) => ({
          property: p.property,
          rooms: p.rooms.filter((r) => r.room.id === params.roomId),
        }))
        .filter((p) => p.rooms.length > 0);
    }
    if (params.propertyId) {
      return data.data.filter((p) => p.property.id === params.propertyId);
    }
    return data.data;
  }, [data, params.propertyId, params.roomId]);

  const modifiersClassNames = {
    booked: "data-[selected=true]:!bg-red-500/80 data-[selected=true]:!text-white after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-red-500",
    available: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-green-500",
    unavailable: "opacity-50 after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-gray-400",
  } as const;

  const buildModifiers = (calendar: { date: string; available: boolean; stock: number; booked: boolean }[]) => {
    const month = params.month;
    const year = params.year;
    const toDates = (pred: (d: any) => boolean) =>
      calendar
        .filter((d) => {
          const dt = new Date(d.date);
          return dt.getMonth() + 1 === month && dt.getFullYear() === year && pred(d);
        })
        .map((d) => new Date(d.date));

    return {
      booked: toDates((d) => d.booked === true),
      available: toDates((d) => d.available === true && !d.booked && d.stock > 0),
      unavailable: toDates((d) => d.available === false || d.stock <= 0),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Property Availability</h2>
          <p className="text-muted-foreground">Tenant dapat melihat ketersediaan properti dan kamar dalam bentuk kalender.</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading ? "animate-spin" : "")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Bulan</span>
              <Select value={String(params.month)} onValueChange={(v) => setParams({ ...params, month: Number(v) })}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Bulan" /></SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>{format(new Date(2024, m - 1, 1), "LLLL")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Tahun</span>
              <Select value={String(params.year)} onValueChange={(v) => setParams({ ...params, year: Number(v) })}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Tahun" /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Properti</span>
              <Select
                value={params.propertyId ? String(params.propertyId) : "all"}
                onValueChange={(v) => setParams({ ...params, propertyId: v !== "all" ? Number(v) : undefined, roomId: undefined })}
              >
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Semua Properti" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Properti</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Kamar</span>
              <Select
                value={params.roomId ? String(params.roomId) : "all"}
                onValueChange={(v) => setParams({ ...params, roomId: v !== "all" ? Number(v) : undefined })}
                disabled={!params.propertyId}
              >
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Semua Kamar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kamar</SelectItem>
                  {params.propertyId && roomsByProperty.get(params.propertyId)?.map((r) => (
                    <SelectItem key={r.room.id} value={String(r.room.id)}>{r.room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>Tersedia</div>
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>Booked</div>
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-gray-400"></span>Tidak tersedia/Habis</div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="space-y-6">
          {selectedRooms.map((p) => (
            <Card key={p.property.id}>
              <CardHeader>
                <CardTitle>{p.property.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {p.rooms.map((r) => {
                    const modifiers = buildModifiers(r.calendar);
                    return (
                      <div key={r.room.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{r.room.name}</div>
                          <div className="text-xs text-muted-foreground">Room ID: {r.room.id}</div>
                        </div>
                        <Calendar
                          month={new Date(params.year, params.month - 1, 1)}
                          numberOfMonths={1}
                          captionLayout="label"
                          modifiers={modifiers}
                          modifiersClassNames={modifiersClassNames}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
