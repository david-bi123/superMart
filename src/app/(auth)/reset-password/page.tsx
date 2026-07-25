"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft, Store, ShieldCheck } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPassword } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    try {
      const result = await resetPassword(data.token, data.password);
      if (result.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(result.error || "Failed to reset password");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 dark:from-gray-950 dark:via-emerald-950 dark:to-teal-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
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
          <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
          <p className="text-emerald-100/60">Enter your new password below</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="glass-card rounded-2xl p-8"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mx-auto">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Password Reset!</h2>
              <p className="text-sm text-white/50">Your password has been updated successfully.</p>
              <p className="text-xs text-white/30">Redirecting to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">Reset Password</h2>
                <p className="text-sm text-white/50">Choose a strong password for your account</p>
              </div>

              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.password?.message}
                icon={<Lock className="w-4 h-4" />}
                iconPosition="right"
                {...register("password")}
              />

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                icon={<Lock className="w-4 h-4" />}
                iconPosition="right"
                {...register("confirmPassword")}
              />

              <Button type="submit" loading={loading} className="w-full h-12 text-base" variant="secondary">
                Reset Password
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </form>
          )}
        </motion.div>
      </div>

      <Toaster />
    </div>
  );
}
