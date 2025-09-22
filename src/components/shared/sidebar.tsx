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
    CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

type SidebarItem = {
  title: string;
  href: string;
  icon: any;
  badge: string | null;
  roles?: string[]; // allowed roles; if omitted, visible to all
};

const sidebarGroups: { title: string; items: SidebarItem[] }[] = [
  {
		title: "General",
		items: [
			
		
			{
				title: "Sales Report",
				href: "/dashboard/reports/sales",
				icon: BarChart3,
				badge: null,
				roles: ["admin", "tenant"],
			},
      {
        title: "Transactions",
        href: "/dashboard/transactions",
        icon: CreditCard,
        badge: null,
        roles: ["tenant"],
      },
			{
				title: "Property Report",
				href: "/dashboard/reports/property-availability",
				icon: FileText,
				badge: null,
				roles: ["admin", "tenant"],
			},
			
		],
	},

	{
		title: "Property",
		items: [
			{
				title: "Properties",
				href: "/dashboard/property/property-list",
				icon: Settings,
				badge: null,
				roles: ["tenant"],
			},
			{
				title: "Create Property",
				href: "/dashboard/property/create",
				icon: Settings,
				badge: null,
				roles: ["tenant"],
			},
			{
				title: "Room",
				href: "/dashboard/rooms/create",
				icon: Settings,
				badge: null,
				roles: ["tenant"],
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
  const { data: session } = useSession();
  const role = (() => {
    const r = (session?.user as any)?.role;
    return typeof r === "string" ? r.toLowerCase() : undefined;
  })();

	const handleLinkClick = () => {
		if (onMobileClose) {
			onMobileClose();
		}
	};

	return (
		<div
			className={cn(
				"flex h-full flex-col border-r bg-card shadow-sm transition-all duration-300",
				isCollapsed ? "w-16" : "w-72",
			)}
		>
			{/* Logo */}
			<div className="flex h-16 items-center border-b px-6 justify-between">
				{!isCollapsed && (
					<Link href="/dashboard" className="flex items-center gap-3 group">
						<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
							<LayoutDashboard className="w-4 h-4 text-primary-foreground" />
						</div>
						<span className="text-xl font-bold group-hover:text-primary transition-colors">
							Dashboard
						</span>
					</Link>
				)}
				{isCollapsed && (
					<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
						<LayoutDashboard className="w-4 h-4 text-primary-foreground" />
					</div>
				)}
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 hover:bg-muted"
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					{isCollapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Navigation Groups */}
			<nav className="flex-1 space-y-8 p-6">
				{sidebarGroups
					.map((group) => ({
						title: group.title,
						items: group.items.filter((item) => {
							// If item has role restrictions
							if (item.roles && item.roles.length > 0) {
								// Hide until role is known
								if (!role) return false;
								return item.roles.map((r) => r.toLowerCase()).includes(role);
							}
							// Items without roles are public
							return true;
						}),
					}))
					.filter((g) => g.items.length > 0)
					.map((group) => (
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
											isCollapsed && "justify-center px-3 py-4",
										)}
										title={isCollapsed ? item.title : undefined}
									>
										<Icon
											className={cn(
												"transition-all duration-200",
												isCollapsed ? "h-5 w-5" : "h-4 w-4",
												isActive && !isCollapsed && "text-primary-foreground",
											)}
										/>
										{!isCollapsed && (
											<span className="group-hover:translate-x-0.5 transition-transform duration-200">
												{item.title}
											</span>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>
		</div>
	);
}