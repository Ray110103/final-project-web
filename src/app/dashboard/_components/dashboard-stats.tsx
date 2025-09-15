// src/components/tenant/dashboard-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  CreditCard, 
  DollarSign, 
  Users, 
  Home,
  Star,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface DashboardStatsProps {
  totalRevenue: number;
  totalBookings: number;
  activeProperties: number;
  averageRating: number;
  revenueChange?: number;
  bookingsChange?: number;
  propertiesChange?: number;
  ratingChange?: number;
}

export function DashboardStats({
  totalRevenue,
  totalBookings,
  activeProperties,
  averageRating,
  revenueChange = 0,
  bookingsChange = 0,
  propertiesChange = 0,
  ratingChange = 0
}: DashboardStatsProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Stats data for dashboard
  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      description: `${revenueChange >= 0 ? '+' : ''}${revenueChange}% from last month`,
      trend: revenueChange >= 0 ? "up" : "down",
      color: revenueChange >= 0 ? "text-emerald-600" : "text-red-600",
      bgColor: revenueChange >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
    {
      title: "Total Bookings",
      value: totalBookings.toLocaleString(),
      icon: Activity,
      description: `${bookingsChange >= 0 ? '+' : ''}${bookingsChange}% from last month`,
      trend: bookingsChange >= 0 ? "up" : "down",
      color: bookingsChange >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: bookingsChange >= 0 ? "bg-blue-50" : "bg-red-50",
    },
    {
      title: "Active Properties",
      value: activeProperties.toString(),
      icon: Home,
      description: `${propertiesChange >= 0 ? '+' : ''}${propertiesChange} from last month`,
      trend: propertiesChange >= 0 ? "up" : "down",
      color: propertiesChange >= 0 ? "text-purple-600" : "text-red-600",
      bgColor: propertiesChange >= 0 ? "bg-purple-50" : "bg-red-50",
    },
    {
      title: "Average Rating",
      value: averageRating.toFixed(1),
      icon: Star,
      description: `${ratingChange >= 0 ? '+' : ''}${ratingChange} from last month`,
      trend: ratingChange >= 0 ? "up" : "down",
      color: ratingChange >= 0 ? "text-orange-600" : "text-red-600",
      bgColor: ratingChange >= 0 ? "bg-orange-50" : "bg-red-50",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        
        return (
          <Card
            key={stat.title}
            className="group hover:shadow-lg transition-all duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:bg-primary/10 transition-colors`}>
                <Icon className={`h-5 w-5 ${stat.color} group-hover:text-primary transition-colors`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="flex items-center text-sm">
                <TrendIcon className={`h-4 w-4 mr-1 ${stat.color}`} />
                <p className={`${stat.color} leading-relaxed`}>
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}