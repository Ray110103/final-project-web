"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useSalesReport } from "@/app/dashboard/reports/_hooks/use-sales-report";
import { Calendar as CalendarIcon, ArrowUpDown, ArrowDownWideNarrow, ArrowUpWideNarrow, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

export default function SalesReportPage() {
  const { data, loading, error, params, setParams, refetch } = useSalesReport({
    groupBy: "property",
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
    take: 20,
  });

  const selectedRange: DateRange | undefined = useMemo(() => {
    if (!params.startDate && !params.endDate) return undefined;
    return {
      from: params.startDate ? new Date(params.startDate) : undefined,
      to: params.endDate ? new Date(params.endDate) : undefined,
    };
  }, [params.startDate, params.endDate]);

  const setRange = (range?: DateRange) => {
    setParams({
      ...params,
      startDate: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
      endDate: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
      page: 1,
    });
  };

  const toggleSortOrder = () => {
    setParams({ ...params, sortOrder: params.sortOrder === "asc" ? "desc" : "asc" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Report</h2>
          <p className="text-muted-foreground">View sales by Property, Transaction, or User.</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading ? "animate-spin" : "")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Group by</span>
              <Select
                value={params.groupBy}
                onValueChange={(v) => setParams({ ...params, groupBy: v as any, page: 1 })}
              >
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Group by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Sort by</span>
              <Select
                value={params.sortBy}
                onValueChange={(v) => setParams({ ...params, sortBy: v as any, page: 1 })}
              >
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={toggleSortOrder} title="Toggle sort order">
                {params.sortOrder === "asc" ? (
                  <ArrowUpWideNarrow className="h-4 w-4" />
                ) : (
                  <ArrowDownWideNarrow className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Date range</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !selectedRange && "text-muted-foreground")}> 
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedRange?.from ? (
                      selectedRange.to ? (
                        <>
                          {format(selectedRange.from, "LLL dd, y")} - {format(selectedRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(selectedRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={selectedRange}
                    onSelect={setRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {(params.startDate || params.endDate) && (
                <Button variant="ghost" onClick={() => setRange(undefined)} className="text-muted-foreground">Clear</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.meta?.totalSales?.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) || "IDR 0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.meta?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.meta?.page ?? 1}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Card>
        <CardHeader>
          <CardTitle>
            {params.groupBy === "property" && "Sales by Property"}
            {params.groupBy === "transaction" && "Transactions"}
            {params.groupBy === "user" && "Sales by User"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              {params.groupBy === "property" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.data as any[])?.map((row: any, idx: number) => {
                      const key = row?.property?.id ?? row?.property?.slug ?? row?.property?.title ?? idx;
                      return (
                        <TableRow key={String(key)}>
                          <TableCell className="font-medium">{row?.property?.title || row?.property?.name || "-"}</TableCell>
                          <TableCell>{row?.property?.city || "-"}</TableCell>
                          <TableCell className="text-right">{Number(row?.totalSales || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</TableCell>
                          <TableCell className="text-right">{row?.transactions?.length ?? row?.count ?? 0}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {params.groupBy === "transaction" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.data as any[])?.map((t: any, idx: number) => {
                      const key = t?.id ?? t?.uuid ?? idx;
                      return (
                        <TableRow key={String(key)}>
                          <TableCell className="font-medium">{t?.uuid}</TableCell>
                          <TableCell>{t?.user?.name || t?.username}</TableCell>
                          <TableCell>{t?.room?.property?.title || t?.room?.property?.name}</TableCell>
                          <TableCell>{t?.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}</TableCell>
                          <TableCell className="text-right">{Number(t?.total || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {params.groupBy === "user" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.data as any[])?.map((row: any, idx: number) => {
                      const key = row?.user?.id ?? row?.user?.email ?? row?.username ?? idx;
                      return (
                        <TableRow key={String(key)}>
                          <TableCell className="font-medium">{row?.user?.name || row?.username}</TableCell>
                          <TableCell>{row?.user?.email || "-"}</TableCell>
                          <TableCell className="text-right">{Number(row?.totalSales || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</TableCell>
                          <TableCell className="text-right">{row?.transactions?.length ?? row?.count ?? 0}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  disabled={(data?.meta?.page ?? 1) <= 1}
                  onClick={() => setParams({ ...params, page: (data?.meta?.page ?? 1) - 1 })}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {data?.meta?.page ?? 1}
                </div>
                <Button
                  variant="outline"
                  disabled={((data?.meta?.page ?? 1) * (data?.meta?.take ?? 20)) >= (data?.meta?.total ?? 0)}
                  onClick={() => setParams({ ...params, page: (data?.meta?.page ?? 1) + 1 })}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
