"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Store,
  ChevronRight,
  Check,
  Zap,
  BarChart3,
  HeadphonesIcon,
  ShieldCheck,
} from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerBusiness } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    setLoading(true);
    try {
      const result = await registerBusiness(data);
      if (result.success) {
        toast.success("Account created! Please check your email to verify.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Zap, text: "Lightning-fast checkout experience" },
    { icon: BarChart3, text: "Real-time sales analytics & reports" },
    { icon: ShieldCheck, text: "Bank-level security & encryption" },
    { icon: HeadphonesIcon, text: "24/7 dedicated support team" },
  ];

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
              Everything you need to run your business
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 text-emerald-100/90"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <p className="text-sm font-medium">{benefit.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background dark:from-primary/5 dark:via-background py-12">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-background/80 backdrop-blur-2xl border border-border/60 rounded-2xl premium-shadow-lg p-8 space-y-4"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
              <p className="text-sm text-muted-foreground">Fill in the details below</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Business Name"
                placeholder="My Store Inc."
                error={errors.businessName?.message}
                icon={<Building2 className="w-4 h-4" />}
                {...register("businessName")}
              />

              <Input
                label="Your Name"
                placeholder="John Doe"
                error={errors.name?.message}
                icon={<User className="w-4 h-4" />}
                {...register("name")}
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                icon={<Mail className="w-4 h-4" />}
                {...register("email")}
              />

              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                error={errors.phone?.message}
                icon={<Phone className="w-4 h-4" />}
                {...register("phone")}
              />

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

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  icon={<Lock className="w-4 h-4" />}
                  {...register("confirmPassword")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group pt-2">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/50 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  I accept the{" "}
                  <span className="text-primary hover:text-primary/80 underline underline-offset-2">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-primary hover:text-primary/80 underline underline-offset-2">
                    Privacy Policy
                  </span>
                </span>
              </label>

              <Button
                type="submit"
                loading={loading}
                disabled={!acceptedTerms}
                className="w-full h-12 text-base"
                variant="gradient"
              >
                Create Account
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
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
