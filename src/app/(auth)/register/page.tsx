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
  Loader2,
  Store,
  ChevronRight,
  Check,
} from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerBusiness } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "@/components/ui/toast";

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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 dark:from-gray-950 dark:via-emerald-950 dark:to-teal-950 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
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
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-emerald-100/60">Create your RetailFlow account</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-2xl p-8 space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Register Your Business</h2>
            <p className="text-sm text-white/50">Fill in the details below</p>
          </div>

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

          <Input
            label="Password"
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

          <label className="flex items-start gap-3 cursor-pointer group pt-2">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
              I accept the{" "}
              <span className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                Privacy Policy
              </span>
            </span>
          </label>

          <Button
            type="submit"
            loading={loading}
            disabled={!acceptedTerms}
            className="w-full h-12 text-base"
            variant="secondary"
          >
            Create Account
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.form>
      </div>

      <Toaster />
    </div>
  );
}
