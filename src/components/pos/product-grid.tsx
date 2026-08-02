"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Package, Grid3X3, List } from "lucide-react";
import { usePosStore } from "@/store/use-pos";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  categoryId: string;
  barcode: string;
  tax: number;
}

interface ProductGridProps {
  onCartToggle?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/50 overflow-hidden">
      <Skeleton variant="rectangular" className="aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton variant="text" className="h-5 w-16" />
          <Skeleton variant="text" className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ onCartToggle }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const debouncedSearch = useDebounce(search, 300);
  const addItem = usePosStore((s) => s.addItem);
  const items = usePosStore((s) => s.items);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("page", page.toString());
      params.set("limit", "30");

      const res = await fetch(`/api/pos/products?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, page]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?limit=50");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory]);

  const handleAddItem = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Only ${product.stock} in stock`);
        return;
      }
      usePosStore.getState().updateQuantity(product.id, existing.quantity + 1);
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        discount: 0,
        tax: product.tax || 0,
        image: product.image,
      });
    }
    toast.success(`${product.name} added`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-2 shrink-0">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search products by name, SKU, or barcode..."
            className="w-full"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="shrink-0"
        >
          {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto shrink-0 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("")}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            !selectedCategory
              ? "bg-primary/20 text-primary border-primary/30"
              : "text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap",
              selectedCategory === cat.id
                ? "bg-primary/20 text-primary border-primary/30"
                : "text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        {loading ? (
          <div className={cn(
            "grid gap-3",
            viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              : "grid-cols-1"
          )}>
            {Array.from({ length: 15 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">No products found</p>
            <p className="text-muted-foreground/50 text-xs mt-1">Try a different search or category</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                "grid gap-3",
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "grid-cols-1"
              )}
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => {
                  const outOfStock = product.stock <= 0;
                  const cartItem = items.find((i) => i.productId === product.id);

                  return (
                    <motion.button
                      key={product.id}
                      variants={cardVariants}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={!outOfStock ? { y: -4, scale: 1.02 } : {}}
                      whileTap={!outOfStock ? { scale: 0.97 } : {}}
                      onClick={() => handleAddItem(product)}
                      disabled={outOfStock}
                      className={cn(
                        "relative rounded-2xl border text-left transition-all duration-200 overflow-hidden group",
                        outOfStock
                          ? "border-border/20 bg-muted/30 opacity-50 cursor-not-allowed"
                          : "border-border/50 bg-muted/50 hover:border-primary/30 hover:bg-muted hover:shadow-lg hover:shadow-primary/5",
                        viewMode === "list" && "flex items-center gap-4"
                      )}
                    >
                      <div className={cn(
                        "relative overflow-hidden bg-muted/30",
                        viewMode === "grid" ? "aspect-square" : "h-16 w-16 shrink-0 rounded-xl m-2"
                      )}>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <Package className={cn(
                              "text-muted-foreground/50",
                              viewMode === "grid" ? "h-8 w-8" : "h-5 w-5"
                            )} />
                          </div>
                        )}
                        {outOfStock && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={cn(
                        viewMode === "grid" ? "p-3" : "flex-1 py-2 pr-3"
                      )}>
                        <p className="text-sm font-medium text-foreground truncate leading-tight">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-0.5 truncate">
                          {product.sku}
                        </p>
                        <div className={cn(
                          "flex items-center gap-2",
                          viewMode === "grid" ? "mt-2" : "mt-1"
                        )}>
                          <span className="text-sm font-bold text-foreground">
                            {formatMoney(product.price)}
                          </span>
                          <Badge
                            variant={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "destructive"}
                            className="ml-auto text-[10px] px-1.5 py-0"
                          >
                            {product.stock}
                          </Badge>
                        </div>
                      </div>

                      {cartItem && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary-foreground">{cartItem.quantity}</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
