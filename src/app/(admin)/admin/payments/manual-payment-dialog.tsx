"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createManualPaymentAction } from "./actions";

export function ManualPaymentDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createManualPaymentAction(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Manual payment recorded and access granted.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Record manual payment</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">Record manual payment</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="userId" className="text-xs font-medium text-muted-foreground">
              Student user ID
            </Label>
            <Input id="userId" name="userId" required placeholder="uuid" className="font-mono text-xs" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="productId" className="text-xs font-medium text-muted-foreground">
              Product ID
            </Label>
            <Input id="productId" name="productId" required placeholder="uuid" className="font-mono text-xs" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="amountBdt" className="text-xs font-medium text-muted-foreground">
              Amount (BDT)
            </Label>
            <Input id="amountBdt" name="amountBdt" type="number" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bkashReference" className="text-xs font-medium text-muted-foreground">
              bKash reference number
            </Label>
            <Input id="bkashReference" name="bkashReference" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="note" className="text-xs font-medium text-muted-foreground">
              Note
            </Label>
            <Textarea id="note" name="note" rows={2} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Recording..." : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
