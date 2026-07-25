"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  User,
  Percent,
  DollarSign,
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  ArrowLeftRight,
  Pause,
  ChevronDown,
} from "lucide-react";
import { usePosStore, CartItem } from "@/store/use-pos";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";
import { CustomerSelect } from "./customer-select";
import { PaymentDialog } from "./payment-dialog";
import { ReceiptPreview } from "./receipt-preview";
import type { ReceiptData } from "@/types";

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "mobile_money", label: "Mobile", icon: Smartphone },
  { value: "split", label: "Split", icon: ArrowLeftRight },
  { value: "credit", label: "Credit", icon: Building2 },
];

const itemVariants = {
  hidden: { opacity: 0, x: 20, height: 0 },
  visible: { opacity: 1, x: 0, height: "auto", transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, x: 20, height: 0, transition: { duration: 0.2, ease: "easeIn" as const } },
};

function CartItemRow({ item, onUpdateQuantity, onRemove, onUpdateDiscount }: {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onUpdateDiscount: (id: string, d: number) => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.name}</p>
          <p className="text-xs text-white/40 truncate">{item.sku}</p>
        </div>
        <button
          onClick={() => onRemove(item.productId)}
          className="h-7 w-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-all shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
            className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Minus className="h-3 w-3 text-white/70" />
          </motion.button>
          <span className="w-8 text-center text-sm font-semibold text-white tabular-nums">
            {item.quantity}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Plus className="h-3 w-3 text-white/70" />
          </motion.button>
        </div>

        <div className="ml-auto text-right">
          <p className="text-sm font-semibold text-white">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
          {item.discount > 0 && (
            <p className="text-[10px] text-red-400">-${item.discount.toFixed(2)}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/30" />
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.discount || ""}
            onChange={(e) => onUpdateDiscount(item.productId, parseFloat(e.target.value) || 0)}
            placeholder="Discount"
            className="w-full h-7 pl-7 pr-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <span className="text-xs text-white/40 w-16 text-right">
          @${item.price.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}

export function CartPanel() {
  const store = usePosStore();
  const {
    items, customerName, customerId, paymentMethod,
    removeItem, updateQuantity, updateDiscount, clearCart,
    setCustomer, setPaymentMethod, getTotals,
  } = store;

  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [heldSales, setHeldSales] = useState<{ items: CartItem[]; customerName?: string; customerId?: string }[]>([]);
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const totals = useMemo(() => getTotals(), [items]);

  const handleHoldSale = () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setHeldSales((prev) => [...prev, { items: [...items], customerName, customerId }]);
    clearCart();
    toast.success("Sale held");
  };

  const handleCompleteSale = async (data: { paymentMethod: string; amountPaid: number; change: number }) => {
    try {
      const res = await fetch("/api/pos/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            price: i.price,
            discount: i.discount,
            tax: i.tax,
          })),
          customerId,
          paymentMethod: data.paymentMethod,
          amountPaid: data.amountPaid,
          change: data.change,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Sale failed");
      }

      const receipt: ReceiptData = {
        businessName: json.receipt?.businessName || "RetailFlow Store",
        businessLogo: json.receipt?.businessLogo || "",
        address: json.receipt?.address || "123 Main Street",
        phone: json.receipt?.phone || "+1 (555) 000-0000",
        tin: json.receipt?.tin,
        cashier: json.receipt?.cashier || "Cashier",
        customer: customerName,
        items: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          total: i.price * i.quantity - i.discount + i.tax,
        })),
        subtotal: totals.subtotal,
        discount: totals.discountTotal,
        tax: totals.taxTotal,
        grandTotal: totals.grandTotal,
        paymentMethod: data.paymentMethod,
        amountPaid: data.amountPaid,
        change: data.change,
        receiptNumber: json.receipt?.receiptNumber || `RCP-${Date.now()}`,
        date: new Date(),
        footer: json.receipt?.footer || "Thank you for your purchase!",
      };
      setLastReceipt(receipt);
      setShowReceipt(true);
      clearCart();
      toast.success("Sale completed!");
    } catch (err) {
      throw err;
    }
  };

  const cartContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-white/70" />
          <h2 className="text-sm font-semibold text-white">Cart</h2>
          <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0">
            {items.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleHoldSale} disabled={items.length === 0}>
            <Pause className="h-3.5 w-3.5" />
            Hold
          </Button>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart}>
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-b border-white/10 shrink-0">
        <button
          onClick={() => setShowCustomerSelect(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-200"
        >
          <div className="h-7 w-7 rounded-full bg-violet-600/20 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {customerName || "Walk-in Customer"}
            </p>
            <p className="text-[10px] text-white/40">Tap to change</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-white/30" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-48 text-center"
            >
              <ShoppingCart className="h-10 w-10 text-white/10 mb-3" />
              <p className="text-sm text-white/40">Cart is empty</p>
              <p className="text-xs text-white/20 mt-1">Tap products to add them</p>
            </motion.div>
          ) : (
            <motion.div
              key="items"
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    onUpdateDiscount={updateDiscount}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      <div className="border-t border-white/10 px-4 py-3 space-y-3 shrink-0">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Subtotal</span>
            <span className="text-white/80">${totals.subtotal.toFixed(2)}</span>
          </div>
          {totals.discountTotal > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Discount</span>
              <span className="text-red-400">-${totals.discountTotal.toFixed(2)}</span>
            </div>
          )}
          {totals.taxTotal > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Tax</span>
              <span className="text-white/80">${totals.taxTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-white/10">
            <span className="text-sm font-bold text-white">Total</span>
            <span className="text-lg font-bold text-white">${totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isActive = paymentMethod === method.value;
            return (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={cn(
                  "flex flex-col items-center gap-1 py-1.5 rounded-lg border transition-all duration-200",
                  isActive
                    ? "border-violet-500/50 bg-violet-600/10"
                    : "border-white/5 bg-white/[0.02] hover:border-white/20"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-violet-400" : "text-white/40")} />
                <span className={cn("text-[8px] font-medium", isActive ? "text-violet-300" : "text-white/40")}>
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          className="w-full h-12 text-base"
          disabled={items.length === 0}
          onClick={() => setShowPayment(true)}
        >
          <DollarSign className="h-5 w-5" />
          Pay ${totals.grandTotal.toFixed(2)}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <button
            onClick={() => setMobileCartOpen(!mobileCartOpen)}
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center"
          >
            <ShoppingCart className="h-6 w-6" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {mobileCartOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                  onClick={() => setMobileCartOpen(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] rounded-t-2xl border-t border-white/10 bg-gray-950 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-center pt-2 pb-1">
                    <div className="h-1 w-10 rounded-full bg-white/20" />
                  </div>
                  {cartContent}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="w-[420px] shrink-0 border-l border-white/10 bg-white/[0.02] flex flex-col h-full">
          {cartContent}
        </div>
      )}

      <CustomerSelect
        open={showCustomerSelect}
        onOpenChange={setShowCustomerSelect}
        onSelect={setCustomer}
      />

      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        onConfirm={handleCompleteSale}
      />

      <ReceiptPreview
        open={showReceipt}
        onOpenChange={setShowReceipt}
        receipt={lastReceipt}
      />
    </>
  );
}
