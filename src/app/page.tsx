"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Store,
  Menu,
  X,
  Package,
  CreditCard,
  BarChart3,
  Users,
  GitBranch,
  Shield,
  Check,
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  Globe,
  Sparkles,
} from "lucide-react";

function useScrollNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const dir = {
    up: { y: 40 },
    left: { x: -40 },
    right: { x: 40 },
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dir[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ─── */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const FEATURES = [
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Real-time stock tracking, automated reordering, and multi-warehouse control.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: CreditCard,
    title: "Point of Sale",
    description:
      "Lightning-fast checkout supporting cash, card, mobile payments, and digital receipts.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Comprehensive dashboards with real-time sales data, trends, and custom reports.",
    color: "from-violet-500 to-violet-600",
  },
  {
    icon: Users,
    title: "Customer Management",
    description:
      "Build customer profiles, track purchase history, and run loyalty programs.",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: GitBranch,
    title: "Multi-Branch Support",
    description:
      "Manage multiple locations from a single dashboard with centralized or per-branch control.",
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 compliant, end-to-end encryption, role-based access, and automated backups.",
    color: "from-cyan-500 to-cyan-600",
  },
];

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "₵0",
    period: "forever",
    description: "Perfect for small businesses getting started.",
    popular: false,
    features: [
      "Up to 500 products",
      "Single branch",
      "Basic analytics",
      "Email support",
      "POS system",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Professional",
    price: "₵29",
    period: "/month",
    description: "Best for growing retail businesses.",
    popular: true,
    features: [
      "Unlimited products",
      "Up to 5 branches",
      "Advanced analytics",
      "Priority support",
      "Customer management",
      "Inventory forecasting",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "₵99",
    period: "/month",
    description: "For large retail chains and enterprises.",
    popular: false,
    features: [
      "Everything in Professional",
      "Unlimited branches",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise option",
      "Custom reporting",
    ],
    cta: "Contact Sales",
  },
];

const HERO_STATS = [
  { value: "10,000+", label: "Businesses", icon: Store },
  { value: "50,000+", label: "Users", icon: Users },
  { value: "99.9%", label: "Uptime", icon: Zap },
];

const ABOUT_STATS = [
  { value: "2020", label: "Founded" },
  { value: "40+", label: "Countries" },
  { value: "4.9/5", label: "Rating" },
];

const TESTIMONIALS = [
  {
    quote:
      "RetailFlow completely transformed how we manage our 12 stores. The multi-branch feature alone saved us 20 hours a week.",
    name: "Sarah Chen",
    role: "COO, UrbanMart",
    rating: 5,
  },
  {
    quote:
      "The POS is incredibly fast and the analytics give me real-time visibility into every store's performance. Best investment we made.",
    name: "James Okafor",
    role: "Founder, QuickStop",
    rating: 5,
  },
  {
    quote:
      "We switched from three different tools to RetailFlow. Everything we need is in one place, and the team support is outstanding.",
    name: "Maria Lopez",
    role: "Owner, FreshDaily",
    rating: 5,
  },
];

/* ─── Page ─── */

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrollNav();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-sans">
      {/* ─── Ambient Background ─── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 mesh-gradient-bg" />
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-teal-500/[0.03] blur-[100px]" />
      </div>

      {/* ─── Navigation ─── */}
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-border/40 bg-background/80 shadow-lg shadow-black/[0.03] backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-emerald">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-gradient">RetailFlow</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white shadow-emerald transition-all hover:shadow-emerald-lg active:scale-[0.97]"
            >
              Get Started
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ─── Mobile Nav ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-72 border-l border-border bg-background/95 p-6 backdrop-blur-2xl md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-gradient text-lg font-bold">
                  RetailFlow
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
                <a
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="rounded-lg gradient-primary px-3 py-2.5 text-center text-sm font-medium text-white shadow-emerald transition-all hover:shadow-emerald-lg"
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── Hero ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by 10,000+ businesses worldwide
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Run your retail
            <br />
            <span className="text-gradient-hero">like a well-oiled machine</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Inventory, POS, analytics, customers, and staff — all in one
            powerful platform built for modern retail.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="/register"
              className="group inline-flex h-12 items-center gap-2.5 rounded-xl gradient-primary px-7 text-sm font-semibold text-white shadow-emerald-lg transition-all duration-300 hover:shadow-[0_8px_40px_-4px_hsl(142_76%_36%/_0.4)] active:scale-[0.97]"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#features"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-border bg-background/50 px-7 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-muted/50 active:scale-[0.97]"
            >
              See Features
            </a>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 grid grid-cols-3 gap-6 sm:gap-10"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold sm:text-3xl">{stat.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 w-full max-w-5xl"
        >
          <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-background to-muted/20 shadow-2xl shadow-black/10 transition-shadow duration-500 hover:shadow-black/15">
            {/* Browser bar */}
            <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="ml-3 flex-1 rounded-md bg-muted/60 px-3 py-1 text-center text-[10px] font-medium text-muted-foreground">
                retailflow.app/dashboard
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="relative grid grid-cols-4 gap-3 p-4 sm:grid-cols-6 sm:gap-4 sm:p-6">
              {/* Revenue chart placeholder */}
              <div className="col-span-4 row-span-2 rounded-xl bg-gradient-to-br from-emerald-500/8 to-teal-500/5 p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-20 rounded-full bg-foreground/10" />
                    <div className="h-6 w-28 rounded-md bg-emerald-500/20" />
                  </div>
                  <div className="h-2.5 w-16 rounded-full bg-foreground/10" />
                </div>
                <div className="flex gap-2">
                  {[40, 55, 35, 60, 45, 70, 50].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-lg bg-emerald-500/15"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Side panels */}
              <div className="col-span-2 hidden rounded-xl bg-muted/40 p-4 sm:block">
                <div className="mb-3 h-2 w-14 rounded-full bg-foreground/10" />
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-foreground/8" />
                  <div className="h-1.5 w-3/4 rounded-full bg-foreground/8" />
                  <div className="h-1.5 w-5/6 rounded-full bg-foreground/8" />
                </div>
              </div>
              <div className="col-span-2 rounded-xl bg-muted/40 p-4">
                <div className="mb-2 h-2 w-10 rounded-full bg-foreground/10" />
                <div className="text-xl font-bold text-emerald-500">+24%</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-foreground/8" />
              </div>

              {/* Bottom row */}
              <div className="col-span-2 rounded-xl bg-muted/40 p-4">
                <div className="mb-2 h-2 w-12 rounded-full bg-foreground/10" />
                <div className="text-xl font-bold">₵12.4k</div>
                <div className="mt-2 h-1.5 w-3/4 rounded-full bg-foreground/8" />
              </div>
              <div className="col-span-2 rounded-xl bg-muted/40 p-4">
                <div className="mb-2 h-2 w-14 rounded-full bg-foreground/10" />
                <div className="text-xl font-bold text-emerald-500">1,248</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-foreground/8" />
              </div>
              <div className="col-span-2 hidden rounded-xl bg-muted/40 p-4 sm:block">
                <div className="mb-2 h-2 w-10 rounded-full bg-foreground/10" />
                <div className="text-xl font-bold">89%</div>
                <div className="mt-2 h-1.5 w-5/6 rounded-full bg-foreground/8" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── Logo Bar ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 border-y border-border/40 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Powering retail businesses across the globe
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["UrbanMart", "QuickStop", "FreshDaily", "MegaRetail", "PrimeStore"].map((name) => (
              <span
                key={name}
                className="text-lg font-bold text-muted-foreground/25 transition-colors hover:text-muted-foreground/40"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── Features ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section
        id="features"
        className="relative z-10 px-4 py-28 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              Features
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="mt-5 text-center text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need to
              <br className="hidden sm:block" />
              run your retail business
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
              Powerful tools designed to streamline every aspect of your retail
              operations.
            </p>
          </FadeIn>

          <StaggerChildren
            className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            delay={0.15}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <div className="group relative rounded-2xl border border-border/50 bg-background/60 p-7 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-0.5">
                    <div
                      className={cn(
                        "mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:scale-110",
                        feature.color
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── Bento Highlight ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-4 pb-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-3">
            <FadeIn delay={0} className="lg:col-span-2">
              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-emerald-500/[0.06] to-teal-500/[0.03] p-8 sm:p-10 transition-all duration-300 hover:shadow-xl">
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold">Real-time Analytics</h3>
                  <p className="mt-3 max-w-md text-muted-foreground">
                    Track sales, revenue, and performance across every branch in
                    real time. Make data-driven decisions with customizable
                    dashboards and reports.
                  </p>
                  <a
                    href="#pricing"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
                {/* Decorative chart bars */}
                <div className="absolute bottom-0 right-0 flex items-end gap-2 p-8 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity">
                  {[40, 65, 50, 80, 60, 95, 70, 100, 85].map((h, i) => (
                    <div
                      key={i}
                      className="w-6 rounded-t-md bg-emerald-600"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/60 p-8 transition-all duration-300 hover:shadow-xl">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Globe className="h-5 w-5 text-violet-500" />
                </div>
                <h3 className="text-xl font-bold">Multi-Branch</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Manage unlimited locations from one dashboard. Centralize
                  inventory or give each branch autonomy.
                </p>
                <div className="mt-6 flex -space-x-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground"
                    >
                      {["NY", "LD", "TK", "LG", "+3"][i]}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── Testimonials ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 border-y border-border/40 px-4 py-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              Testimonials
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mt-5 text-center text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Loved by retailers
            </h2>
          </FadeIn>

          <StaggerChildren
            className="mt-16 grid gap-6 md:grid-cols-3"
            delay={0.15}
          >
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <div className="flex h-full flex-col rounded-2xl border border-border/50 bg-background/60 p-7 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.04]">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── Pricing ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section
        id="pricing"
        className="relative z-10 px-4 py-28 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              Pricing
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="mt-5 text-center text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
              Choose the plan that fits your business. No hidden fees.
            </p>
          </FadeIn>

          <StaggerChildren
            className="mt-16 grid gap-6 lg:grid-cols-3 lg:gap-5"
            delay={0.15}
          >
            {PRICING_TIERS.map((tier) => (
              <StaggerItem key={tier.name}>
                <div
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
                    tier.popular
                      ? "border-primary/30 bg-gradient-to-b from-primary/[0.04] via-background to-background shadow-lg shadow-primary/[0.06] lg:scale-[1.02]"
                      : "border-border/50 bg-background/60 backdrop-blur-sm hover:shadow-lg hover:shadow-black/[0.04]"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-4 py-1 text-xs font-semibold text-white shadow-emerald">
                        <Star className="h-3 w-3 fill-white" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/register"
                    className={cn(
                      "inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all active:scale-[0.97]",
                      tier.popular
                        ? "gradient-primary text-white shadow-emerald hover:shadow-emerald-lg"
                        : "border border-border bg-background text-foreground hover:bg-muted/50"
                    )}
                  >
                    {tier.cta}
                  </a>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── About ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section
        id="about"
        className="relative z-10 border-t border-border/40 px-4 py-28 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              About
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Built for modern retail
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              RetailFlow is a multi-tenant SaaS platform designed to help retail
              businesses of all sizes streamline operations, boost sales, and
              deliver exceptional customer experiences.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              {ABOUT_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-background/60 p-7 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.04]"
                >
                  <div className="text-3xl font-bold text-gradient-subtle">
                    {stat.value}
                  </div>
                  <div className="mt-1.5 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── CTA ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-4 pb-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/50">
          <div className="relative bg-gradient-to-br from-emerald-500/[0.08] via-background to-teal-500/[0.06] px-8 py-20 text-center sm:px-16">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[60px]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 translate-x-1/2 translate-y-1/2 rounded-full bg-teal-500/10 blur-[60px]" />

            <FadeIn>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Ready to transform your
                  <br className="hidden sm:block" />
                  retail business?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
                  Start your free trial today. No credit card required.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <a
                    href="/register"
                    className="group inline-flex h-14 items-center gap-2.5 rounded-xl gradient-primary px-10 text-base font-semibold text-white shadow-emerald-lg transition-all duration-300 hover:shadow-[0_8px_40px_-4px_hsl(142_76%_36%/_0.4)] active:scale-[0.97]"
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── Footer ─── */}
      {/* ═══════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border/40 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <Store className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-gradient">RetailFlow</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Support
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RetailFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
