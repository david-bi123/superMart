"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePosStore } from "@/store/use-pos";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { toast } from "@/components/ui/toast";

export default function POSPage() {
  const clearCart = usePosStore((s) => s.clearCart);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "Escape":
          if (usePosStore.getState().items.length > 0) {
            clearCart();
            toast.info("Cart cleared");
          }
          break;
        case "F1":
          e.preventDefault();
          toast.info("F1: Quick Price Check");
          break;
        case "F2":
          e.preventDefault();
          toast.info("F2: Hold Sale");
          break;
        case "F3":
          e.preventDefault();
          toast.info("F3: Search Products");
          break;
        case "F4":
          e.preventDefault();
          toast.info("F4: Reports");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearCart]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-x-0 top-16 bottom-0 flex bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
    >
      <div className="flex-1 flex flex-col min-w-0">
        <ProductGrid />
      </div>
      <CartPanel />
    </motion.div>
  );
}
