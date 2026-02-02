"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";

interface MakePaymentButtonProps {
  studentId: string;
  currentBalance: number;
  stripeEnabled: boolean;
}

export function MakePaymentButton({ studentId, currentBalance, stripeEnabled }: MakePaymentButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(currentBalance > 0 ? currentBalance.toFixed(2) : "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!stripeEnabled || currentBalance <= 0) return null;

  const handlePayment = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (parsedAmount > currentBalance) {
      setError("Amount cannot exceed your current balance");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            amount: parsedAmount,
            description: "Tuition Payment",
          }),
        });

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error || "Failed to create payment session");
        }
      } catch {
        setError("An error occurred. Please try again.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <CreditCard className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            Current balance: ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Payment Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={currentBalance}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0.00"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePayment}
              isLoading={isPending}
              disabled={isPending}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${parseFloat(amount || "0").toFixed(2)}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            You will be redirected to Stripe for secure payment processing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
