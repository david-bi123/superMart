"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils/cn";
import { useSidebar } from "@/store/use-sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Command,
  ChevronRight,
  Home,
} from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  "dashboard": "Dashboard",
  "pos": "POS",
  "inventory": "Inventory",
  "products": "Products",
  "categories": "Categories",
  "brands": "Brands",
  "suppliers": "Suppliers",
  "purchases": "Purchases",
  "orders": "Orders",
  "sales": "Sales",
  "customers": "Customers",
  "expenses": "Expenses",
  "reports": "Reports",
  "financial": "Financial",
  "employees": "Employees",
  "settings": "Settings",
  "profile": "Profile",
  "users": "Users",
  "billing": "Billing",
  "notifications": "Notifications",
  "new": "New",
};

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const { theme, setTheme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { open } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border/40 bg-background/70 dark:bg-background/60 backdrop-blur-xl px-4 sm:px-6">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => open()}
            className="shrink-0"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </Button>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
          <Link href="/dashboard" className="hover:text-foreground transition-colors shrink-0">
            <Home size={16} />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight size={14} className="shrink-0 opacity-30" />
              <Link
                href={crumb.href}
                className={cn(
                  "truncate hover:text-foreground transition-colors",
                  i === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""
                )}
                aria-current={i === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex text-muted-foreground"
            aria-label="Search"
          >
            <Search size={18} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 text-muted-foreground h-9 w-52 justify-between bg-muted/50 hover:bg-muted border-border/50 rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Search size={14} />
              <span className="text-muted-foreground/70">Search...</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground/50">
              <Command size={10} />K
            </kbd>
          </Button>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
              3
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground"
            aria-label="Toggle theme"
          >
            <Sun size={18} className="rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon size={18} className="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full ml-1" aria-label="Account menu">
                <Avatar className="h-8 w-8">
                  {user?.image && <AvatarImage src={user.image} alt={user?.name ?? ""} />}
                  <AvatarFallback>{getInitials(user?.name ?? "U")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{user?.name ?? "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User size={16} className="mr-2 text-muted-foreground" />
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings size={16} className="mr-2 text-muted-foreground" />
                Settings
                <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-destructive focus:text-destructive">
                <LogOut size={16} className="mr-2" />
                Sign out
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-border/40 px-4">
                <Search size={18} className="text-muted-foreground/70 shrink-0" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, products, customers..."
                  className="h-14 border-0 bg-transparent px-0 text-base placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border border-border/50 bg-muted px-2 text-xs font-mono text-muted-foreground/60">
                  ESC
                </kbd>
              </div>
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">Quick actions</div>
                {[
                  { label: "Create Product", href: "/dashboard/inventory/products/new" },
                  { label: "New Sale", href: "/dashboard/pos" },
                  { label: "Add Customer", href: "/dashboard/customers" },
                  { label: "Purchase Order", href: "/dashboard/purchases/orders/new" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <ChevronRight size={14} className="text-muted-foreground/40" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
