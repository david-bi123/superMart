"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 15 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10"
        >
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-emerald transition-all hover:shadow-emerald-lg active:scale-[0.97]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted/50 active:scale-[0.97]"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
