"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, Send, Store, CheckCircle2 } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPassword } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setSent(true);
      } else {
        toast.error(result.error || "Failed to send reset email");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Marketing */}
      <div className="hidden md:flex md:w-[40%] lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950 items-center justify-center p-12">
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
            <p className="text-emerald-200/80 text-lg">
              Securely manage your account
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background dark:from-primary/5 dark:via-background">
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
            className="bg-background/80 backdrop-blur-2xl border border-border/60 rounded-2xl premium-shadow-lg p-8"
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-emerald-2xl/30 shadow-lg mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Check Your Email</h2>
                <p className="text-sm text-muted-foreground">
                  If an account exists with that email, we&apos;ve sent a password reset link.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Forgot password?</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  icon={<Mail className="w-4 h-4" />}
                  {...register("email")}
                />

                <Button type="submit" loading={loading} className="w-full h-12 text-base" variant="gradient">
                  Send Reset Link
                  {!loading && <Send className="w-4 h-4" />}
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
