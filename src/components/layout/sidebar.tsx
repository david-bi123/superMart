"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { hasPermission } from "@/lib/auth/permissions";
import { useSidebar } from "@/store/use-sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Receipt,
  Users,
  Wallet,
  BarChart3,
  UserCog,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  permission?: string;
  children?: { label: string; href: string; permission?: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard", permission: "pos:access" },
  { label: "POS", icon: <ShoppingCart size={20} />, href: "/pos", permission: "pos:access" },
  {
    label: "Inventory",
    icon: <Package size={20} />,
    permission: "products:read",
    children: [
      { label: "Products", href: "/inventory/products", permission: "products:read" },
      { label: "Categories", href: "/inventory/categories", permission: "products:read" },
      { label: "Brands", href: "/inventory/brands", permission: "products:read" },
      { label: "Suppliers", href: "/suppliers", permission: "suppliers:manage" },
    ],
  },
  { label: "Purchases", icon: <Truck size={20} />, href: "/purchases/orders", permission: "purchases:create" },
  { label: "Sales", icon: <Receipt size={20} />, href: "/sales", permission: "sales:read" },
  { label: "Customers", icon: <Users size={20} />, href: "/customers", permission: "customers:manage" },
  { label: "Expenses", icon: <Wallet size={20} />, href: "/expenses", permission: "expenses:manage" },
  {
    label: "Reports",
    icon: <BarChart3 size={20} />,
    permission: "reports:read",
    children: [
      { label: "Financial", href: "/reports/financial", permission: "reports:financial" },
      { label: "Inventory", href: "/reports/inventory", permission: "reports:read" },
      { label: "Sales", href: "/reports/sales", permission: "reports:read" },
    ],
  },
  { label: "Employees", icon: <UserCog size={20} />, href: "/employees", permission: "users:manage" },
  {
    label: "Settings",
    icon: <Settings size={20} />,
    permission: "settings:manage",
    children: [
      { label: "Profile", href: "/settings/profile", permission: "settings:manage" },
      { label: "Users", href: "/settings/users", permission: "users:manage" },
      { label: "Billing", href: "/settings/billing", permission: "settings:manage" },
      { label: "Notifications", href: "/settings/notifications", permission: "settings:manage" },
    ],
  },
];

const superAdminNavItems: NavItem[] = [
  {
    label: "Platform Admin",
    icon: <LayoutDashboard size={20} />,
    children: [
      { label: "Overview", href: "/admin" },
      { label: "Audit Logs", href: "/audit-logs" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    label: "Settings",
    icon: <Settings size={20} />,
    children: [
      { label: "Profile", href: "/settings/profile" },
      { label: "Users", href: "/settings/users" },
      { label: "Billing", href: "/settings/billing" },
      { label: "Notifications", href: "/settings/notifications" },
    ],
  },
];

function SidebarNavItem({ item, collapsed, onItemClick }: { item: NavItem; collapsed: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const [expanded, setExpanded] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
  });

  if (item.permission && !hasPermission(role, item.permission)) return null;

  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
  const hasActiveChild = item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

  const linkContent = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
        (isActive || hasActiveChild)
          ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/8 hover:text-sidebar-foreground"
      )}
      onClick={() => {
        if (item.children) { setExpanded((e) => !e); }
      }}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.children && (
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="opacity-40" />
            </motion.span>
          )}
        </>
      )}
    </div>
  );

  const wrapper = collapsed ? (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2 font-medium">
        {item.label}
        {hasActiveChild && <Badge variant="primary" className="h-1.5 w-1.5 rounded-full p-0" />}
      </TooltipContent>
    </Tooltip>
  ) : (
    linkContent
  );

  return (
    <div>
      {item.href && !item.children ? (
        <Link href={item.href} onClick={onItemClick}>{wrapper}</Link>
      ) : (
        wrapper
      )}
      <AnimatePresence initial={false}>
        {item.children && expanded && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-2 mt-1 space-y-0.5 border-l border-sidebar-border/40 pl-3">
              {item.children.map((child) => {
                if (child.permission && !hasPermission(role, child.permission)) return null;
                const isChildActive = pathname === child.href;
                return (
                  <Link key={child.href} href={child.href} onClick={onItemClick}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                        isChildActive
                          ? "bg-primary/8 text-primary font-medium"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/8 hover:text-sidebar-foreground"
                      )}
                    >
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        isChildActive ? "bg-primary" : "bg-current opacity-30"
                      )} />
                      <span className="truncate">{child.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ onItemClick }: { onItemClick?: () => void }) {
  const { isOpen, toggle, close } = useSidebar();
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role ?? "";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border",
          isMobile
            ? "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transition-transform duration-300 ease-in-out"
            : "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300 ease-in-out"
        )}
        role={isMobile ? "dialog" : undefined}
        aria-modal={isMobile ? "true" : undefined}
        aria-label="Sidebar navigation"
        style={
          isMobile
            ? { transform: isOpen ? "translateX(0)" : "translateX(-100%)" }
            : { width: isOpen ? "18rem" : "72px" }
        }
      >
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border/30 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-emerald-500/20">
              <Store size={18} className="text-white" />
            </div>
            <motion.div
              animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-bold text-gradient">RetailFlow</p>
              <p className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-widest">POS System</p>
            </motion.div>
          </div>
          {isMobile ? (
            <button
              onClick={close}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/40 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground transition-colors"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={toggle}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/40 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground transition-colors"
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {(role === "super_admin" ? superAdminNavItems : navItems).map((item) => (
              <SidebarNavItem key={item.label} item={item} collapsed={!isOpen && !isMobile} onItemClick={onItemClick || (isMobile ? close : undefined)} />
            ))}
          </nav>
        </ScrollArea>

        <div className="shrink-0 border-t border-sidebar-border/30 p-3">
          {isOpen || isMobile ? (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent/5 transition-colors">
              <Avatar className="h-9 w-9 shrink-0">
                {user?.image && <AvatarImage src={user.image} alt={user?.name ?? ""} />}
                <AvatarFallback>{getInitials(user?.name ?? "U")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name ?? "User"}</p>
                <p className="truncate text-xs text-sidebar-foreground/50 capitalize">{role.replace(/_/g, " ")}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Avatar className="h-9 w-9">
                    {user?.image && <AvatarImage src={user.image} alt={user?.name ?? ""} />}
                    <AvatarFallback>{getInitials(user?.name ?? "U")}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{user?.name ?? "User"}</p>
                  <p className="text-xs text-muted-foreground">{role.replace(/_/g, " ")}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
