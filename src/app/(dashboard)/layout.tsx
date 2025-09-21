// app/dashboard/layout.tsx
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { Sidebar } from "@/components/navbar/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ORGANIZER") {
    return notFound();
  }

  return (
    <div className="bg-background relative flex h-screen flex-col">
      {/* Topbar - Fixed at the top */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar - Fixed left below topbar */}
        <div className="fixed top-16 left-0 z-40 hidden h-[calc(100vh-4rem)] w-72 border-r lg:block">
          <Sidebar />
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-auto lg:pl-72">
          <main className="mx-auto w-full max-w-[calc(100vw-1.5rem)] p-6 md:p-8 lg:max-w-[calc(100vw-20rem)]">
            <div className="min-h-[calc(100vh-8rem)]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}