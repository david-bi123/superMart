"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Store,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  Clock,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { checkAccountStatus } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const status = await checkAccountStatus(data.email);
        if (!status.success) {
          toast.error(status.error || "Invalid email or password");
        } else {
          toast.error("Invalid email or password");
        }
        return;
      }

      if (result?.ok) {
        toast.success("Welcome back!");
        const session = await getSession();
        const role = session?.user?.role;
        const target =
          role === "super_admin"
            ? "/admin"
            : callbackUrl && callbackUrl !== "/dashboard"
              ? callbackUrl
              : "/dashboard";
        setTimeout(() => router.push(target), 500);
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Two-factor verified");
    setShowTwoFactor(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Marketing */}
      <div className="hidden md:flex md:w-[40%] lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950 items-center justify-center p-12">
        {/* Animated gradient blobs */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-16 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 30, 0], y: [0, 20, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-16 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 15, -15, 0], y: [0, -10, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-emerald-2xl/30 shadow-lg mb-6"
            >
              <Store className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
              Retail<span className="text-emerald-300">Flow</span>
            </h1>
            <p className="text-emerald-200/80 text-lg mb-10">
              Multi-tenant POS system for modern businesses
            </p>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-center gap-3 text-emerald-100/90"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">10k+</p>
                  <p className="text-xs text-emerald-200/60">Businesses trust us</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-3 text-emerald-100/90"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">50k+</p>
                  <p className="text-xs text-emerald-200/60">Active users</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center gap-3 text-emerald-100/90"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">99.9%</p>
                  <p className="text-xs text-emerald-200/60">Uptime guaranteed</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background dark:from-primary/5 dark:via-background">
        {/* Subtle background blobs for mobile */}
        <div className="absolute inset-0 overflow-hidden md:hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile-only branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:hidden"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-emerald-2xl/30 shadow-lg mb-3"
            >
              <Store className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">
              Retail<span className="text-primary">Flow</span>
            </h2>
          </motion.div>

          <AnimatePresence mode="wait">
            {showTwoFactor ? (
              <motion.div
                key="two-factor"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-background/80 backdrop-blur-2xl border border-border/60 rounded-2xl premium-shadow-lg p-8 space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl gradient-primary shadow-emerald-2xl/30 shadow-lg mb-3">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Two-Factor Authentication</h2>
                  <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
                </div>

                <div className="space-y-2">
                  <Input
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                    maxLength={6}
                    icon={<ShieldCheck className="w-4 h-4" />}
                  />
                </div>

                <Button type="submit" onClick={handleTwoFactorSubmit} loading={loading} className="w-full h-12 text-base" variant="gradient">
                  Verify Code
                </Button>

                <button
                  type="button"
                  onClick={() => setShowTwoFactor(false)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to login
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-background/80 backdrop-blur-2xl border border-border/60 rounded-2xl premium-shadow-lg p-8 space-y-5"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                  <p className="text-sm text-muted-foreground">Sign in to your RetailFlow account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    icon={<Mail className="w-4 h-4" />}
                    {...register("email")}
                  />

                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        error={errors.password?.message}
                        icon={<Lock className="w-4 h-4" />}
                        {...register("password")}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/50 focus:ring-offset-0 cursor-pointer"
                          {...register("rememberMe")}
                        />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          Remember me
                        </span>
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <Button type="submit" loading={loading} className="w-full h-12 text-base" variant="gradient">
                    Sign In
                    {!loading && <ChevronRight className="w-4 h-4" />}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-background/80 text-muted-foreground/50">or</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Create one
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
