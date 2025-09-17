// src/app/(tenant)/dashboard/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  CreditCard, 
  DollarSign, 
  Users, 
  Calendar,
  Home,
  Star,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Mail,
  RefreshCw
} from "lucide-react";
import { TransactionList } from '@/components/tenant/transaction-list';
import { DashboardStats } from '@/components/tenant/dashboard-stats';
import { useGetTransactions } from './_hooks/use-transactions';
import { TransactionStatus } from '@/types/transaction';

export default function TenantDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">("ALL");
  const router = useRouter();

  const { data: transactionsData, loading, error, refetch } = useGetTransactions({
    status: statusFilter !== "ALL" ? statusFilter : undefined
  });

  // Calculate stats from transaction data
  const calculateStats = () => {
    if (!transactionsData?.data) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        activeProperties: 0,
        averageRating: 0,
        revenueChange: 0,
        bookingsChange: 0,
        propertiesChange: 0,
        ratingChange: 0
      };
    }

    // Calculate total revenue from completed transactions
    const totalRevenue = transactionsData.data
      .filter(t => t.status === "PAID")
      .reduce((sum, transaction) => sum + transaction.total, 0);

    // Total bookings (all transactions)
    const totalBookings = transactionsData.data.length;

    // Count unique properties
    const propertyIds = new Set(transactionsData.data.map(t => t.room.property?.id));
    const activeProperties = propertyIds.size;

    // Calculate average rating (dummy data for now)
    const averageRating = 4.7;

    // Dummy change percentages
    const revenueChange = 20.1;
    const bookingsChange = 12.5;
    const propertiesChange = 3;
    const ratingChange = 0.3;

    return {
      totalRevenue,
      totalBookings,
      activeProperties,
      averageRating,
      revenueChange,
      bookingsChange,
      propertiesChange,
      ratingChange
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Tenant Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back! Here&apos;s an overview of your properties and transactions.
        </p>
      </div>

      {/* Stats Grid */}
      <DashboardStats {...stats} />

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Transactions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Recent Transactions
                </CardTitle>
                <p className="text-muted-foreground">
                  Latest transactions from your properties
                </p>
              </CardHeader>
              <CardContent>
                {transactionsData?.data && transactionsData.data.length > 0 ? (
                  <div className="space-y-4">
                    {transactionsData.data.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.user.name}</p>
                            <p className="text-sm text-muted-foreground">{transaction.room.property?.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {transaction.status === "PAID" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : transaction.status === "WAITING_FOR_CONFIRMATION" ? (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge variant={
                              transaction.status === "PAID" ? "default" : 
                              transaction.status === "WAITING_FOR_CONFIRMATION" ? "secondary" : "destructive"
                            }>
                              {transaction.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">
                            {transaction.total.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("transactions")}>
                      View All Transactions
                    </Button>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No transactions found</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Recent Activity
                </CardTitle>
                <p className="text-muted-foreground">
                  Latest updates from your dashboard
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">New booking received</p>
                    <p className="text-sm text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Payment confirmed</p>
                    <p className="text-sm text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <div className="flex-1">
                    <p className="font-medium">New review received</p>
                    <p className="text-sm text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <div className="flex-1">
                    <p className="font-medium">Property availability updated</p>
                    <p className="text-sm text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <TransactionList 
            transactionsData={transactionsData}
            loading={loading}
            error={error}
            refetch={refetch}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Sales Report
                </CardTitle>
                <p className="text-muted-foreground">
                  View your sales performance
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold">
                      {stats.totalRevenue.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Transactions</span>
                    <span className="text-lg font-bold">{stats.totalBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Transaction</span>
                    <span className="text-lg font-bold">
                      {stats.totalBookings > 0 
                        ? (stats.totalRevenue / stats.totalBookings).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                        : "IDR 0"}
                    </span>
                  </div>
                  <Button className="w-full" onClick={() => router.push('/dashboard/reports/sales')}>View Detailed Report</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Property Report
                </CardTitle>
                <p className="text-muted-foreground">
                  View your property availability
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Properties</span>
                    <span className="text-lg font-bold">{stats.activeProperties}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Rating</span>
                    <span className="text-lg font-bold">{stats.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Occupancy Rate</span>
                    <span className="text-lg font-bold">78%</span>
                  </div>
                  <Button className="w-full">View Detailed Report</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}