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
  Home,
  Building2,
  Bed,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarGroups = [
  {
    title: "General",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        badge: null,
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        badge: "New",
      },
      {
        title: "Sales Report",
        href: "/dashboard/reports/sales",
        icon: BarChart3,
        badge: null,
      },
      {
        title: "Property Report",
        href: "/dashboard/reports/property-availability",
        icon: FileText,
        badge: null,
      },
    ],
  },

  {
    title: "Property",
    items: [
      {
        title: "Property List",
        href: "/dashboard/property/property-list",
        icon: Building2,
        badge: null,
      },
      {
        title: "Property Category",
        href: "/dashboard/property/property-category",
        icon: FolderKanban,
        badge: null,
      },
      {
        title: "Create Property",
        href: "/dashboard/property/create-property",
        icon: Building2,
        badge: null,
      },
      {
        title: "Room List",
        href: "/dashboard/rooms/room-list",
        icon: Bed,
        badge: null,
      },
      {
        title: "Create Room",
        href: "/dashboard/rooms/create",
        icon: Bed,
        badge: null,
      },
      {
        title: "Room Availability",
        href: "/dashboard/rooms/rooms-availability",
        icon: Calendar,
        badge: null,
      },
      {
        title: "Seasonal Rates",
        href: "/dashboard/rooms/seasonal-rates",
        icon: CalendarClock,
        badge: null,
      },
    ],
  },

  {
    title: "Pages",
    items: [
      {
        title: "Users",
        href: "/dashboard/users",
        icon: Users,
        badge: "12",
      },
      {
        title: "Projects",
        href: "/dashboard/projects",
        icon: FolderKanban,
        badge: null,
      },
      {
        title: "Documents",
        href: "/dashboard/documents",
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
      {
        title: "Error Pages",
        href: "/dashboard/errors",
        icon: AlertCircle,
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
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card shadow-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6 justify-between">
        {!isCollapsed ? (
          <Link href="/" className="flex items-center gap-3 group" onClick={handleLinkClick}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold group-hover:text-primary transition-colors">
                PropertyRent
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
                Back to Home
              </span>
            </div>
          </Link>
        ) : (
          <Link 
            href="/" 
            onClick={handleLinkClick} 
            title="PropertyRent - Back to Home"
            className="group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto hover:bg-primary/90 transition-all duration-200 group-hover:scale-105">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
          </Link>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Enhanced Back to Home Link */}
      <div className="px-6 pt-4 pb-2">
        <Link
          href="/"
          onClick={handleLinkClick}
          className={cn(
            "group flex items-center rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary hover:text-primary/80 border border-primary/20 hover:border-primary/40 hover:shadow-sm",
            isCollapsed ? "gap-0 px-3 py-3 justify-center" : "gap-3 px-3 py-2.5"
          )}
          title={isCollapsed ? "Back to Home" : undefined}
        >
          <Home className={cn(
            "transition-all duration-200",
            isCollapsed ? "h-4 w-4" : "h-4 w-4"
          )} />
          {!isCollapsed && (
            <span className="group-hover:translate-x-0.5 transition-transform duration-200 font-medium">
              Back to Home
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-8 px-6 pb-6">
        {sidebarGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            {/* Group Title */}
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4">
                {group.title}
              </h3>
            )}

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
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                        : "text-muted-foreground hover:text-foreground",
                      isCollapsed && "justify-center px-3 py-4"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon
                      className={cn(
                        "transition-all duration-200",
                        isCollapsed ? "h-5 w-5" : "h-4 w-4",
                        isActive && !isCollapsed && "text-primary-foreground"
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200 flex-1">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full font-medium",
                            isActive 
                              ? "bg-primary-foreground/20 text-primary-foreground" 
                              : "bg-primary text-primary-foreground"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Enhanced Footer */}
      <div className="border-t p-4 space-y-3">
        {/* Additional Home Link in Footer (Optional) */}
        {!isCollapsed && (
          <Link
            href="/"
            onClick={handleLinkClick}
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Home className="h-3 w-3" />
            <span>Quick Home Access</span>
          </Link>
        )}

        {!isCollapsed ? (
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">
              PropertyRent Dashboard
            </p>
            <p className="text-xs text-muted-foreground/60">
              v1.0.0
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}