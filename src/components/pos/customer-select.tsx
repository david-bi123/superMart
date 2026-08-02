"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, User, Phone, Mail, Check } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { getCustomers, createCustomer } from "@/actions/customers.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CustomerSelectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string, name: string) => void;
}

export function CustomerSelect({ open, onOpenChange, onSelect }: CustomerSelectProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCustomers({
        search: debouncedSearch || undefined,
        limit: 20,
      });
      if (result.success) {
        setCustomers(
          (result.data || []).map((c) => ({
            _id: c._id,
            name: c.name,
            email: c.email,
            phone: c.phone,
          }))
        );
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { if (open) fetchCustomers(); }, [open, fetchCustomers]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    setCreating(true);
    try {
      const result = await createCustomer({
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
      });
      if (result.success) {
        toast.success("Customer created");
        onSelect(result.data._id, newName.trim());
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(result.error || "Failed to create customer");
      }
    } catch {
      toast.error("Failed to create customer");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setShowNewForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
          <DialogDescription>Search for a customer or add a new one</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full h-10 rounded-xl border border-border/50 bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <ScrollArea className="max-h-64">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-8"
              >
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </motion.div>
            ) : customers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <User className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No customers found</p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                <button
                  onClick={() => {
                    onSelect("walk-in", "Walk-in Customer");
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Walk-in Customer</p>
                    <p className="text-xs text-muted-foreground/50">Default anonymous customer</p>
                  </div>
                  <Check className="h-4 w-4 text-primary ml-auto" />
                </button>
                <div className="border-t border-border/20 my-1" />
                {customers.map((customer) => (
                  <button
                    key={customer._id}
                    onClick={() => {
                      onSelect(customer._id, customer.name);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                        )}
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {showNewForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 pt-2 border-t border-border/50"
          >
            <Input
              label="Name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Customer name"
            />
            <Input
              label="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="customer@example.com"
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Phone"
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              icon={<Phone className="h-4 w-4" />}
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} loading={creating} className="flex-1">
                <UserPlus className="h-4 w-4" />
                Create
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewForm(true)}
              className="w-full"
            >
              <UserPlus className="h-4 w-4" />
              New Customer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
