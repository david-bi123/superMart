import { create } from "zustand";
export interface CartItem { productId: string; name: string; sku: string; price: number; quantity: number; discount: number; tax: number; image?: string; }
interface PosState {
  items: CartItem[];
  customerId?: string;
  customerName?: string;
  paymentMethod: string;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  setCustomer: (id: string, name: string) => void;
  setPaymentMethod: (method: string) => void;
  getTotals: () => { subtotal: number; discountTotal: number; taxTotal: number; grandTotal: number; };
}
export const usePosStore = create<PosState>((set, get) => ({
  items: [],
  paymentMethod: "cash",
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  updateQuantity: (productId, qty) => set((s) => ({ items: s.items.map((i) => i.productId === productId ? { ...i, quantity: qty } : i) })),
  updateDiscount: (productId, discount) => set((s) => ({ items: s.items.map((i) => i.productId === productId ? { ...i, discount } : i) })),
  clearCart: () => set({ items: [], customerId: undefined, customerName: undefined }),
  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  getTotals: () => {
    const items = get().items;
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discountTotal = items.reduce((sum, i) => sum + (i.discount || 0), 0);
    const taxTotal = items.reduce((sum, i) => sum + (i.tax || 0) * i.quantity, 0);
    return { subtotal, discountTotal, taxTotal, grandTotal: subtotal - discountTotal + taxTotal };
  },
}));
