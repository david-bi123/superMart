"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  CreditCard,
  Smartphone,
  ArrowLeftRight,
  Building2,
  Check,
  DollarSign,
} from "lucide-react";
import { usePosStore } from "@/store/use-pos";
import { cn } from "@/lib/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    paymentMethod: string;
    amountPaid: number;
    change: number;
  }) => Promise<void>;
}

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote, color: "from-emerald-600 to-teal-600" },
  { value: "card", label: "Card", icon: CreditCard, color: "from-blue-600 to-cyan-600" },
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone, color: "from-purple-600 to-pink-600" },
  { value: "split", label: "Split", icon: ArrowLeftRight, color: "from-amber-600 to-orange-600" },
  { value: "credit", label: "Credit", icon: Building2, color: "from-rose-600 to-red-600" },
];

export function PaymentDialog({ open, onOpenChange, onConfirm }: PaymentDialogProps) {
  const { items, customerName, paymentMethod, setPaymentMethod, getTotals } = usePosStore();
  const [amountPaid, setAmountPaid] = useState("");
  const [confirming, setConfirming] = useState(false);

  const totals = useMemo(() => getTotals(), [items]);

  const change = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - totals.grandTotal);
  }, [amountPaid, totals.grandTotal]);

  const isCashShort = useMemo(() => {
    if (paymentMethod !== "cash") return false;
    const paid = parseFloat(amountPaid) || 0;
    return paid > 0 && paid < totals.grandTotal;
  }, [amountPaid, paymentMethod, totals.grandTotal]);

  const handleConfirm = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (paymentMethod === "cash") {
      const paid = parseFloat(amountPaid);
      if (!paid || paid < totals.grandTotal) {
        toast.error("Insufficient amount");
        return;
      }
    }

    setConfirming(true);
    try {
      await onConfirm({
        paymentMethod,
        amountPaid: parseFloat(amountPaid) || totals.grandTotal,
        change,
      });
      onOpenChange(false);
    } catch {
      toast.error("Payment failed");
    } finally {
      setConfirming(false);
    }
  };

  const selectedMethod = paymentMethods.find((m) => m.value === paymentMethod);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Sale</DialogTitle>
          <DialogDescription>
            Review and confirm the transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Items ({items.length})</span>
              <span className="text-white/90">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Discount</span>
                <span className="text-red-400">-${totals.discountTotal.toFixed(2)}</span>
              </div>
            )}
            {totals.taxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Tax</span>
                <span className="text-white/90">${totals.taxTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="text-sm font-semibold text-white">Grand Total</span>
              <span className="text-lg font-bold text-white">${totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {customerName && (
            <div className="text-sm text-white/50">
              Customer: <span className="text-white/80 font-medium">{customerName}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Payment Method</label>
            <div className="grid grid-cols-5 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isActive = paymentMethod === method.value;
                return (
                  <motion.button
                    key={method.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPaymentMethod(method.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200",
                      isActive
                        ? "border-violet-500/50 bg-violet-600/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-violet-400" : "text-white/50"
                    )} />
                    <span className={cn(
                      "text-[10px] font-medium leading-tight text-center",
                      isActive ? "text-violet-300" : "text-white/50"
                    )}>
                      {method.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {paymentMethod === "cash" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <Input
                label="Amount Received"
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                icon={<DollarSign className="h-4 w-4" />}
                error={isCashShort ? "Insufficient amount" : undefined}
              />
              {parseFloat(amountPaid) >= totals.grandTotal && (
                <div className="flex justify-between text-sm px-1">
                  <span className="text-white/60">Change</span>
                  <span className="text-emerald-400 font-semibold">${change.toFixed(2)}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={confirming}
            className="flex-1"
          >
            <Check className="h-4 w-4" />
            Confirm ${totals.grandTotal.toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
