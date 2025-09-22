// app/dashboard/rooms/seasonal-rates/page.tsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import SeasonalRateManagement from "./components/SeasonalRateManagement";

const SeasonalRateManagementPage = () => {
  const { data: session, status } = useSession();

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated user
  if (status === "unauthenticated" || !session) {
    redirect("/login");
  }

  // Handle user without tenant role
  if (session.user.role !== "TENANT") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need to have a tenant account to access seasonal rate management.
          </p>
        </Card>
      </div>
    );
  }

  // Render the main component for authenticated tenant users
  return <SeasonalRateManagement />;
};

export default SeasonalRateManagementPage;