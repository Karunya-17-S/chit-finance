"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { getGroupsByCustomer } from "@/data";
import { CheckCircle2, Copy, Printer, Share2 } from "lucide-react";
import type { Branch, ChitGroup, Customer, Payment } from "@/types";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment;
  customer?: Customer;
  branch?: Branch;
  chitGroup?: ChitGroup;
  collectedByName?: string;
}

const MODE_LABELS: Record<string, string> = {
  cash: "CASH",
  upi: "ONLINE",
  bank_transfer: "ONLINE",
  cheque: "CHEQUE",
};

function planLabel(chitValue: number): string {
  if (chitValue >= 100000) {
    const lakhs = chitValue / 100000;
    return `${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)} LAKH`;
  }
  return `${(chitValue / 1000).toFixed(0)}K`;
}

export function ReceiptDialog({ 
  open, 
  onOpenChange, 
  payment, 
  customer, 
  branch, 
  chitGroup, 
  collectedByName 
}: ReceiptDialogProps) {
  if (!payment) return null;

  const membership = customer && chitGroup 
    ? getGroupsByCustomer(customer.id).find((m) => m.chitGroupId === chitGroup.id) 
    : undefined;
  const agreementNo = membership?.agreementNo ?? "—";
  const plan = chitGroup ? planLabel(chitGroup.chitValue) : "—";
  const paymentDateDMY = payment.paymentDate 
    ? payment.paymentDate.split("-").reverse().join("/") 
    : "—";
  const modeLabel = payment.paymentMode ? MODE_LABELS[payment.paymentMode] : "—";
  const isDeposit = payment.paymentCategory === "deposit";

  // Build the message text
  const messageText = [
    "PAYMENT RECEIVED - SHREE VAARI CHIT FINANCE",
    "",
    `DEAR, ${customer?.name.toUpperCase() ?? "CUSTOMER"}`,
    "",
    `YOUR ${isDeposit ? "DEPOSIT" : "PAYMENT"} HAS BEEN SUCCESSFULLY RECORDED`,
    "",
    `AGREEMENT NO : ${agreementNo}`,
    `PLAN : ${plan}`,
    `${isDeposit ? "DEPOSIT AMOUNT" : "INSTALLMENT AMOUNT"} : ₹${payment.paidAmount.toLocaleString("en-IN")}`,
    `BILL NUMBER : ${payment.billNumber ?? "—"}`,
    `PAYMENT DATE : ${paymentDateDMY}`,
    `PAYMENT TYPE : ${modeLabel}`,
    "",
    "THANK YOU FOR YOUR PAYMENT",
  ].join("\n");

  // Generate WhatsApp URL with encoded message
  const getWhatsAppUrl = () => {
    const phoneNumber = customer?.phone || "";
    const encodedMessage = encodeURIComponent(messageText);
    // If phone number exists, send to specific number, else open WhatsApp with just the message
    if (phoneNumber) {
      // Remove any non-digit characters from phone number
      const cleanNumber = phoneNumber.replace(/\D/g, "");
      return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    }
    return `https://wa.me/?text=${encodedMessage}`;
  };

  // Handle Copy to Clipboard
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(messageText);
      toast.success("Payment message copied — ready to paste in WhatsApp/SMS.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  // Handle WhatsApp Share
  function handleWhatsAppShare() {
    const url = getWhatsAppUrl();
    window.open(url, "_blank");
    toast.success("Opening WhatsApp...");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Payment Receipt</DialogTitle>
        </DialogHeader>

        {/* Payment message — mirrors the WhatsApp/SMS confirmation sent to the customer */}
        <div className="rounded-xl border border-border bg-secondary/60 p-5">
          <div className="mb-4 flex items-center justify-between border-b border-dashed border-border pb-3">
            <Logo size="sm" variant="light" />
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-bold tracking-wide text-maroon">PAYMENT RECEIVED — SHREE VAARI CHIT FINANCE</p>
            <p className="font-semibold text-foreground">DEAR, {customer?.name.toUpperCase() ?? "CUSTOMER"}</p>
            <p className="text-muted-foreground">
              YOUR {isDeposit ? "DEPOSIT" : "PAYMENT"} HAS BEEN SUCCESSFULLY RECORDED
            </p>

            <div className="space-y-1.5 rounded-lg bg-card p-3 font-medium text-foreground">
              <ReceiptRow label="AGREEMENT NO" value={agreementNo} />
              <ReceiptRow label="PLAN" value={plan} />
              <ReceiptRow 
                label={isDeposit ? "DEPOSIT AMOUNT" : "INSTALLMENT AMOUNT"} 
                value={`₹${payment.paidAmount.toLocaleString("en-IN")}`} 
              />
              <ReceiptRow label="BILL NUMBER" value={payment.billNumber ?? "—"} />
              <ReceiptRow label="PAYMENT DATE" value={paymentDateDMY} />
              <ReceiptRow label="PAYMENT TYPE" value={modeLabel} />
              {payment.dueAmount - payment.paidAmount > 0 && (
                <ReceiptRow 
                  label="BALANCE DUE" 
                  value={`₹${(payment.dueAmount - payment.paidAmount).toLocaleString("en-IN")}`} 
                  highlight 
                />
              )}
            </div>

            <p className="text-center text-xs font-semibold tracking-wide text-muted-foreground">THANK YOU FOR YOUR PAYMENT</p>
            <p className="text-center text-[11px] text-muted-foreground">
              {branch?.name ?? "Shree Vaari Chit Finance"} · Collected by {collectedByName ?? "—"} · Receipt {payment.receiptNumber ?? "—"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" /> Copy Message
          </Button>
          
          {/* ✅ WhatsApp Share Button */}
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleWhatsAppShare}
          >
            <Share2 className="h-4 w-4 mr-2" /> WhatsApp
          </Button>
          
          <Button 
            onClick={() => window.print()} 
            className="flex-1 bg-maroon hover:bg-maroon-dark"
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </div>

        {/* Optional: Show customer phone if available */}
        {customer?.phone && (
          <p className="text-center text-xs text-muted-foreground mt-1">
            Sending to: {customer.phone}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReceiptRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] tracking-wide text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold text-destructive" : ""}>{value}</span>
    </div>
  );
}