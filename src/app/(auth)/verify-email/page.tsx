"use client";

import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Store, XCircle, Loader2, MailCheck } from "lucide-react";
import { verifyEmail } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        if (active) {
          setStatus("error");
          setError("Missing verification token. Use the link from your email.");
        }
        return;
      }
      const result = await verifyEmail(token);
      if (!active) return;
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(result.error || "Invalid or expired verification token");
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

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
            <p className="text-emerald-200/80 text-lg">Verify your account</p>
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
            {status === "loading" && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg mx-auto">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Verifying your email</h2>
                <p className="text-sm text-muted-foreground">Please wait a moment...</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg mx-auto">
                  <MailCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Email verified!</h2>
                <p className="text-sm text-muted-foreground">
                  Your account has been activated. You can now sign in.
                </p>
                <Button asChild variant="gradient" className="w-full h-12 text-base">
                  <Link href="/login">Continue to Login</Link>
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto border border-destructive/30 bg-destructive/10">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Verification failed</h2>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button asChild variant="outline" className="w-full h-12 text-base">
                  <Link href="/register">Back to Registration</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}