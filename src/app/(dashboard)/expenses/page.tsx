"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Wallet,
  CalendarDays,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getExpenses,
  getExpenseCategories,
  createExpense,
  deleteExpense,
  getExpenseStats,
} from "@/actions/expenses.actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

interface Expense {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  categoryId: string;
  user: string;
  paymentMethod: string;
  isRecurring: boolean;
  createdAt: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesRes, categoriesRes, statsRes] = await Promise.all([
        getExpenses({ search, categoryId: categoryFilter, dateFrom, dateTo, page, limit: 15 }),
        getExpenseCategories(),
        getExpenseStats({ dateFrom, dateTo }),
      ]);
      if (expensesRes.success) {
        setExpenses(expensesRes.data);
        setTotalPages(expensesRes.pagination.totalPages);
      }
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, dateFrom, dateTo, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!formData.description || !formData.amount || !formData.categoryId || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await createExpense({
        description: formData.description,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        date: formData.date,
        paymentMethod: formData.paymentMethod || undefined,
      });
      if (res.success) {
        toast.success("Expense created successfully");
        setShowAddDialog(false);
        setFormData({
          description: "",
          amount: "",
          categoryId: "",
          date: new Date().toISOString().split("T")[0],
          paymentMethod: "",
        });
        fetchData();
      } else {
        toast.error(res.error || "Failed to create expense");
      }
    } catch (error) {
      toast.error("Failed to create expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await deleteExpense(id);
      if (res.success) {
        toast.success("Expense deleted");
        fetchData();
      } else {
        toast.error(res.error || "Failed to delete expense");
      }
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const totalExpenses = stats?.totalExpenses || 0;
  const thisMonth = stats?.byMonth?.[stats.byMonth.length - 1]?.total || 0;
  const daysInRange = dateFrom && dateTo
    ? Math.max(1, Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)))
    : 30;
  const avgPerDay = totalExpenses / daysInRange;

  const statsCards = [
    {
      title: "Total Expenses",
      value: `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      variant: "danger" as const,
      description: "In selected period",
    },
    {
      title: "This Month",
      value: `$${thisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CalendarDays,
      variant: "warning" as const,
      description: "Current month total",
    },
    {
      title: "Average / Day",
      value: `$${avgPerDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      variant: "primary" as const,
      description: "Daily average",
    },
    {
      title: "Categories",
      value: categories.length,
      icon: Receipt,
      variant: "default" as const,
      description: "Active categories",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      <PageHeader
        title="Expenses"
        description="Track and manage business expenses"
        actions={
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        }
      />

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((card) => (
          <Card key={card.title} glass className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground/50">{card.description}</p>
                </div>
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  card.variant === "danger" ? "bg-red-500/15 text-red-400" :
                  card.variant === "warning" ? "bg-amber-500/15 text-amber-400" :
                  card.variant === "primary" ? "bg-blue-500/15 text-blue-400" :
                  "bg-muted text-foreground"
                )}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Expense Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search expenses..."
                  className="flex h-9 w-full rounded-lg border border-border/50 bg-muted/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-[160px]"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-[160px]"
              />
            </div>

            {loading ? (
              <Loading text="Loading expenses..." />
            ) : expenses.length === 0 ? (
              <EmptyState
                title="No expenses found"
                description="Add your first expense to start tracking."
                action={
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Add Expense
                  </Button>
                }
              />
            ) : (
              <>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-medium">{expense.description}</span>
                              {expense.isRecurring && (
                                <Badge variant="warning">Recurring</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{expense.category}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {expense.paymentMethod || "—"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.info("Edit coming soon")}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400"
                                  onClick={() => handleDelete(expense._id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground/50">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record a new business expense
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description *
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Office supplies"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Amount *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                icon={<DollarSign className="h-4 w-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Category *
              </label>
              <Select
                value={formData.categoryId}
                onValueChange={(v) => setFormData((p) => ({ ...p, categoryId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Payment Method
              </label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(v) => setFormData((p) => ({ ...p, paymentMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Save Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
