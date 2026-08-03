"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePosStore } from "@/store/use-pos";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { toast } from "@/components/ui/toast";

export default function POSPage() {
  const clearCart = usePosStore((s) => s.clearCart);
  const [cartSignal, setCartSignal] = useState(0);
  const [searchSignal, setSearchSignal] = useState(0);

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
        case "F3":
        case "/":
          e.preventDefault();
          setSearchSignal((s) => s + 1);
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
      className="flex-1 flex bg-background"
    >
      <div className="flex-1 flex flex-col min-w-0">
        <ProductGrid
          onCartToggle={() => setCartSignal((s) => s + 1)}
          focusSignal={searchSignal}
        />
      </div>
      <CartPanel openSignal={cartSignal} />
    </motion.div>
  );
}
