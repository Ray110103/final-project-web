"use client";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { SessionProvider } from "next-auth/react";
import NextAuth from "next-auth";
import NextAuthProvider from "@/providers/NextAuthProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Topbar />
        <main className="p-8 max-w-[calc(100vw-18rem)] mx-auto">
          <div className="min-h-[calc(100vh-8rem)]">
            <ReactQueryProvider>
              <NextAuthProvider>{children}</NextAuthProvider>
            </ReactQueryProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
