"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
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
  Play,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function useScrollNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
      {children}
    </div>
  );
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
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const directionOffset = { up: { y: 40 }, left: { x: -40 }, right: { x: 40 } };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
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
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
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
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const FEATURES = [
  {
    icon: Package,
    title: "Inventory Management",
    description: "Real-time stock tracking, automated reordering, and multi-warehouse inventory control.",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: CreditCard,
    title: "POS System",
    description: "Lightning-fast point of sale with support for cash, card, mobile payments, and digital receipts.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Comprehensive dashboards with real-time sales data, trends, and customizable reports.",
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  {
    icon: Users,
    title: "Customer Management",
    description: "Build customer profiles, track purchase history, and run targeted loyalty programs.",
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    icon: GitBranch,
    title: "Multi-Branch Support",
    description: "Manage multiple locations from a single dashboard with centralized or per-branch control.",
    color: "from-rose-500 to-rose-600",
    bg: "bg-rose-100 dark:bg-rose-900/30",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant, end-to-end encryption, role-based access, and automated backups.",
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
  },
];

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for small businesses getting started.",
    popular: false,
    features: ["Up to 500 products", "Single branch", "Basic analytics", "Email support", "POS system"],
    cta: "Get Started Free",
    href: "#",
  },
  {
    name: "Professional",
    price: "$29",
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
    href: "#",
  },
  {
    name: "Enterprise",
    price: "$99",
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
    href: "#",
  },
];

const STATS = [
  { value: "10,000+", label: "Businesses" },
  { value: "50,000+", label: "Users" },
  { value: "99.9%", label: "Uptime" },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrollNav();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-sans">
      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      {/* Navigation */}
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border/40 bg-background/80 backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-lg shadow-emerald-500/20">
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
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </button>
            <button className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/35 active:scale-[0.97]">
              Get Started
            </button>
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

      {/* Mobile Nav */}
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
              className="fixed inset-y-0 right-0 z-50 w-72 border-l border-border bg-background p-6 md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-gradient text-lg font-bold">RetailFlow</span>
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
                <button className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Sign In
                </button>
                <button className="rounded-lg gradient-primary px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/35">
                  Get Started
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Animated Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/10 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm"
          >
            <Star className="h-3.5 w-3.5 fill-primary" />
            Multi-Tenant SaaS Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            The Ultimate{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Retail Management
            </span>{" "}
            System
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Everything you need to manage inventory, sales, customers, and staff — all in one powerful
            platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button className="group inline-flex h-12 items-center gap-2 rounded-xl gradient-primary px-8 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.97]">
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background/50 px-8 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-muted/50 active:scale-[0.97]">
              <Play className="h-4 w-4 fill-foreground" />
              Watch Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground sm:gap-10"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">{stat.value}</span>
                <span className="hidden sm:inline">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 w-full max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-background to-muted/30 shadow-2xl shadow-emerald-500/5 dark:shadow-emerald-500/10">
            <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <div className="ml-4 rounded-md bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                retailflow.app/dashboard
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 p-4 sm:grid-cols-6 sm:p-6">
              <div className="col-span-4 row-span-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-3 w-20 rounded-full bg-muted-foreground/10" />
                  <div className="h-3 w-12 rounded-full bg-muted-foreground/10" />
                </div>
                <div className="mb-4 h-8 w-32 rounded-lg bg-emerald-500/20" />
                <div className="flex gap-2">
                  <div className="h-20 flex-1 rounded-lg bg-emerald-500/10" />
                  <div className="h-20 flex-1 rounded-lg bg-emerald-500/15" />
                  <div className="h-20 flex-1 rounded-lg bg-emerald-500/10" />
                </div>
              </div>
              <div className="col-span-2 hidden rounded-xl bg-muted/50 p-4 sm:block">
                <div className="mb-3 h-3 w-16 rounded-full bg-muted-foreground/10" />
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-muted-foreground/10" />
                  <div className="h-2 w-3/4 rounded-full bg-muted-foreground/10" />
                  <div className="h-2 w-5/6 rounded-full bg-muted-foreground/10" />
                </div>
              </div>
              <div className="col-span-2 rounded-xl bg-muted/50 p-4">
                <div className="mb-2 h-3 w-12 rounded-full bg-muted-foreground/10" />
                <div className="text-2xl font-bold text-emerald-500">+24%</div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted-foreground/10" />
              </div>
              <div className="col-span-2 rounded-xl bg-muted/50 p-4 sm:col-span-2">
                <div className="mb-2 h-3 w-14 rounded-full bg-muted-foreground/10" />
                <div className="text-2xl font-bold text-foreground">$12.4k</div>
                <div className="mt-1 h-2 w-3/4 rounded-full bg-muted-foreground/10" />
              </div>
              <div className="col-span-2 rounded-xl bg-muted/50 p-4 sm:col-span-1 sm:hidden">
                <div className="mb-2 h-3 w-10 rounded-full bg-muted-foreground/10" />
                <div className="text-lg font-bold text-foreground">89</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 border-t border-border/40 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center">
            <SectionLabel>Features</SectionLabel>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need to run your retail business
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Powerful tools designed to streamline every aspect of your retail operations.
            </p>
          </FadeIn>

          <StaggerChildren className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" delay={0.2}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <div className="group glass-card-hover rounded-xl p-6 transition-all duration-300">
                    <div
                      className={cn(
                        "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                        feature.bg,
                        "transition-transform duration-300 group-hover:scale-110"
                      )}
                    >
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
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

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 border-t border-border/40 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center">
            <SectionLabel>Pricing</SectionLabel>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Choose the plan that fits your business needs. No hidden fees.
            </p>
          </FadeIn>

          <StaggerChildren className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-6" delay={0.2}>
            {PRICING_TIERS.map((tier) => (
              <StaggerItem key={tier.name}>
                <div
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
                    tier.popular
                      ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/[0.03] to-transparent shadow-xl shadow-emerald-500/10 lg:scale-105"
                      : "glass-card border-border/50"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-3.5 py-1 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20">
                        <Star className="h-3 w-3 fill-white" />
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{tier.period}</span>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={cn(
                      "inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all active:scale-[0.97]",
                      tier.popular
                        ? "gradient-primary text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35"
                        : "border border-border bg-background text-foreground hover:bg-muted/50"
                    )}
                  >
                    {tier.cta}
                  </button>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 border-t border-border/40 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <SectionLabel>About</SectionLabel>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Built for modern retail
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              RetailFlow is a multi-tenant SaaS platform designed to help retail businesses of all sizes
              streamline operations, boost sales, and deliver exceptional customer experiences.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { value: "2020", label: "Founded" },
                { value: "40+", label: "Countries" },
                { value: "4.9/5", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/50 p-6">
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 border-t border-border/40 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to transform your retail business?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Start your free trial today. No credit card required.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="group inline-flex h-14 items-center gap-2 rounded-xl gradient-primary px-10 text-base font-semibold text-white shadow-xl shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.97]">
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <Store className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-gradient">RetailFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RetailFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
