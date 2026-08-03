"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  User,
  Percent,
  Coins,
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
import { createSale } from "@/actions/sales.actions";
import { getReceipt } from "@/actions/receipt.actions";
import { CustomerSelect } from "./customer-select";
import { formatMoney } from "@/lib/format";
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
      className="rounded-xl border border-border/50 bg-muted/50 p-3 space-y-2 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground/50 truncate">{item.sku}</p>
        </div>
        <button
          onClick={() => onRemove(item.productId)}
          className="h-7 w-7 rounded-lg bg-muted/50 hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive flex items-center justify-center transition-all shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
            className="h-7 w-7 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Minus className="h-3 w-3 text-muted-foreground" />
          </motion.button>
          <span className="w-8 text-center text-sm font-semibold text-foreground tabular-nums">
            {item.quantity}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            className="h-7 w-7 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
          </motion.button>
        </div>

        <div className="ml-auto text-right">
          <p className="text-sm font-semibold text-foreground">
            {formatMoney(item.price * item.quantity)}
          </p>
          {item.discount > 0 && (
            <p className="text-[10px] text-destructive">-{formatMoney(item.discount)}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.discount || ""}
            onChange={(e) => onUpdateDiscount(item.productId, parseFloat(e.target.value) || 0)}
            placeholder="Discount"
            className="w-full h-7 pl-7 pr-2 rounded-lg border border-border/50 bg-muted/50 text-xs text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/50"
          />
        </div>
        <span className="text-xs text-muted-foreground/50 w-16 text-right">
          @{formatMoney(item.price)}
        </span>
      </div>
    </motion.div>
  );
}

export function CartPanel({ openSignal = 0 }: { openSignal?: number }) {
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

  useEffect(() => {
    if (openSignal > 0 && isMobile) {
      setMobileCartOpen(true);
    }
  }, [openSignal, isMobile]);

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
      const result = await createSale({
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          quantity: i.quantity,
          price: i.price,
          discount: i.discount,
          tax: i.tax,
          total: i.price * i.quantity - i.discount + i.tax,
        })),
        customerId,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        grandTotal: totals.grandTotal,
        paymentMethod: data.paymentMethod === "split" ? "mixed" : data.paymentMethod,
        paymentDetails: {
          cash: data.paymentMethod === "cash" ? data.amountPaid : 0,
          change: data.change,
        },
      });

      if (!result.success) {
        throw new Error(result.error || "Sale failed");
      }

      let receipt: ReceiptData = {
        businessName: "RetailFlow Store",
        businessLogo: "",
        address: "123 Main Street",
        phone: "+1 (555) 000-0000",
        tin: "",
        cashier: "Cashier",
        customer: customerName || "Walk-in Customer",
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
        receiptNumber: `RCP-${Date.now()}`,
        date: new Date(),
        footer: "Thank you for your purchase!",
      };

      const saleId = result.data?._id;
      if (saleId) {
        const receiptResult = await getReceipt(saleId);
        if (receiptResult.success) {
          receipt = {
            ...receiptResult.data,
            customer: receiptResult.data.customer || customerName || "Walk-in Customer",
            paymentMethod: data.paymentMethod,
            amountPaid: data.amountPaid,
            change: data.change,
          };
        }
      }

      setLastReceipt(receipt);
      setShowReceipt(true);
      clearCart();
      toast.success("Sale completed!");
    } catch (err: any) {
      toast.error(err.message || "Sale failed");
    }
  };

  const cartContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Cart</h2>
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
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border/50 shrink-0">
        <button
          onClick={() => setShowCustomerSelect(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/50 bg-muted/50 hover:bg-muted hover:border-primary/30 transition-all duration-200"
        >
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {customerName || "Walk-in Customer"}
            </p>
            <p className="text-[10px] text-muted-foreground/50">Tap to change</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
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
              <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground/50">Cart is empty</p>
              <p className="text-xs text-muted-foreground/20 mt-1">Tap products to add them</p>
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

      <div className="border-t border-border/50 px-4 py-3 space-y-3 shrink-0">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-muted-foreground">{formatMoney(totals.subtotal)}</span>
          </div>
          {totals.discountTotal > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-destructive">-{formatMoney(totals.discountTotal)}</span>
            </div>
          )}
          {totals.taxTotal > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-muted-foreground">{formatMoney(totals.taxTotal)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-border/50">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">{formatMoney(totals.grandTotal)}</span>
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
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/20 bg-muted/30 hover:border-border"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground/50")} />
                <span className={cn("text-[8px] font-medium", isActive ? "text-primary" : "text-muted-foreground/50")}>
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
          <Coins className="h-5 w-5" />
          Pay {formatMoney(totals.grandTotal)}
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
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center"
          >
            <ShoppingCart className="h-6 w-6" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
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
                  className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                  onClick={() => setMobileCartOpen(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] rounded-t-2xl border-t border-border/50 bg-background backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-center pt-2 pb-1">
                    <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
                  </div>
                  {cartContent}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="w-[420px] shrink-0 border-l border-border/50 bg-muted/30 flex flex-col h-full">
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
