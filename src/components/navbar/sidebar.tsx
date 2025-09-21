"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Database,
  MessageSquare,
  Shield,
  HelpCircle,
  LogIn,
  AlertCircle,
  Menu,
  Ticket,
  Calendar as Calendar1,
  Coins,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { IconListDetails } from "@tabler/icons-react";

const sidebarGroups = [
  {
    title: "Organizer",
    items: [
      {
        title: "Manage Events ",
        href: "/dashboard/manage-events",
        icon: Calendar1,
        badge: null,
        children: [
          {
            title: "Create Event",
            href: "/dashboard/events/create",}
        ]
      },
      {
        title: "Manage Ticket",
        href: "/dashboard/manage-tickets",
        icon: IconListDetails,
        badge: null,
        children: [
          {
            title: "Create Ticket",
            href: "/dashboard/ticket/create",}
        ]
      },
      {
        title: "Statistic",
        href: "/dashboard/statistic",
        icon: BarChart3,
        badge: "New",
      },
      {
        title: "Attendee-List",
        href: "/dashboard/attendee-list",
        icon: FileText,
        badge: null,
      },
      {
        title: "Calendar",
        href: "/dashboard/calendar",
        icon: Calendar,
        badge: "3",
      },
      {
        title: "Auth Pages",
        href: "/dashboard/auth",
        icon: LogIn,
        badge: null,
      },
      
    ],
  },
];

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Always visible on left */}
      <aside className="hidden lg:flex lg:h-full lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 mt-18">
        <div className="flex h-full flex-col gap-y-5 overflow-hidden border-r bg-background">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center border-b px-6">
            <Link href="/dashboard" className="group flex items-center gap-3">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <LayoutDashboard className="text-primary-foreground h-4 w-4" />
              </div>
              <span className="group-hover:text-primary text-xl font-bold transition-colors">
                Dashboard
              </span>
            </Link>
          </div>

          {/* Navigation Groups - Scrollable area */}
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <div className="space-y-8">
              {sidebarGroups.map((group) => (
                <div key={group.title} className="space-y-3">
                  {/* Group Title */}
                  <h3 className="text-muted-foreground mb-4 px-3 text-xs font-semibold tracking-wider uppercase">
                    {group.title}
                  </h3>

                  {/* Group Items */}
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 transition-all duration-200",
                              isActive && "text-primary-foreground",
                            )}
                          />
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                            {item.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar - Sheet component */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

            <div className="flex h-full flex-col overflow-hidden">
              {/* Logo */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
                <Link href="/dashboard" className="group flex items-center gap-3">
                  <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                    <LayoutDashboard className="text-primary-foreground h-4 w-4" />
                  </div>
                  <span className="group-hover:text-primary text-xl font-bold transition-colors">
                    Dashboard
                  </span>
                </Link>
              </div>

              {/* Navigation Groups - Scrollable area */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-8">
                  {sidebarGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                      {/* Group Title */}
                      <h3 className="text-muted-foreground mb-4 px-3 text-xs font-semibold tracking-wider uppercase">
                        {group.title}
                      </h3>

                      {/* Group Items */}
                      <div className="space-y-2">
                        {group.items.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "group hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4 transition-all duration-200",
                                  isActive && "text-primary-foreground",
                                )}
                              />
                              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                                {item.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}