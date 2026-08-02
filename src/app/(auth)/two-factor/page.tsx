"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ShieldCheck, ArrowLeft } from "lucide-react";
import { verifyTwoFactor } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter your verification code");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyTwoFactor(code.trim());
      if (result.success) {
        toast.success("Two-factor verification successful");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Invalid code");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-[42%] relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950 items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-emerald-2xl/30 shadow-lg mb-6">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
              Retail<span className="text-emerald-300">Flow</span>
            </h1>
            <p className="text-emerald-200/80 text-lg">Extra security for your account</p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background dark:from-primary/5 dark:via-background">
        <div className="relative z-10 w-full max-w-md">
          <div className="md:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-lg mb-3">
              <Store className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Retail<span className="text-primary">Flow</span>
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-background/80 backdrop-blur-2xl border border-border/60 rounded-2xl premium-shadow-lg p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg mx-auto">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground">
                  Enter the verification code to confirm your identity
                </p>
              </div>

              <Input
                label="Verification Code"
                type="number"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-[0.5em]"
              />

              <Button type="submit" loading={loading} className="w-full h-12 text-base" variant="gradient">
                Verify Code
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}