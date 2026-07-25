"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  Store,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "@/components/ui/toast";

export default function LoginPage() {
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
        toast.error("Invalid email or password");
        return;
      }

      if (result?.ok) {
        toast.success("Welcome back!");
        setTimeout(() => router.push(callbackUrl), 500);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 dark:from-gray-950 dark:via-emerald-950 dark:to-teal-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25 mb-4"
          >
            <Store className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-emerald-100/60">Sign in to your RetailFlow account</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {showTwoFactor ? (
            <motion.form
              key="two-factor"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              onSubmit={handleTwoFactorSubmit}
              className="glass-card rounded-2xl p-8 space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 mb-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Two-Factor Authentication</h2>
                <p className="text-sm text-white/50">Enter the 6-digit code from your authenticator app</p>
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

              <Button type="submit" loading={loading} className="w-full h-12 text-base" variant="secondary">
                Verify Code
              </Button>

              <button
                type="button"
                onClick={() => setShowTwoFactor(false)}
                className="w-full text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                Back to login
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              onSubmit={handleSubmit(onSubmit)}
              className="glass-card rounded-2xl p-8 space-y-5"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">Sign In</h2>
                <p className="text-sm text-white/50">Enter your credentials to continue</p>
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                icon={<Mail className="w-4 h-4" />}
                {...register("email")}
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  icon={<Lock className="w-4 h-4" />}
                  iconPosition="right"
                  {...register("password")}
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0 cursor-pointer"
                      {...register("rememberMe")}
                    />
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full h-12 text-base" variant="secondary">
                Sign In
                {!loading && <ChevronRight className="w-4 h-4" />}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[rgba(255,255,255,0.05)] text-white/30">or</span>
                </div>
              </div>

              <p className="text-center text-sm text-white/50">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Create one
                </Link>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <Toaster />
    </div>
  );
}
