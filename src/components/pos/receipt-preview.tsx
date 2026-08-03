"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Printer, Download, X, Store } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ReceiptData } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";

interface ReceiptPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: ReceiptData | null;
}

export function ReceiptPreview({ open, onOpenChange, receipt }: ReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receipt.receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 2px; text-align: left; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .border-b { border-bottom: 1px dashed #000; }
            .font-bold { font-weight: bold; }
            .mt-2 { margin-top: 8px; }
            .mb-2 { margin-bottom: 8px; }
            .pt-2 { padding-top: 8px; }
          </style>
        </head>
        <body>
          ${receiptRef.current?.innerHTML || ""}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = async () => {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");
      const canvas = await html2canvas(receiptRef.current!, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ format: [80, canvas.height * 0.75], unit: "mm" });
      pdf.addImage(imgData, "PNG", 0, 0, 80, canvas.height * 0.75);
      pdf.save(`receipt-${receipt.receiptNumber}.pdf`);
      toast.success("Receipt downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Receipt Preview
          </DialogTitle>
        </DialogHeader>

        <div
          ref={receiptRef}
          className="bg-white text-black rounded-xl p-6 font-mono text-xs leading-relaxed"
        >
          <div className="text-center mb-4">
            {receipt.businessLogo && (
              <img src={receipt.businessLogo} alt="Logo" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} className="h-12 mx-auto mb-2 object-contain" />
            )}
            <h2 className="text-base font-bold">{receipt.businessName}</h2>
            <p className="text-[10px] text-gray-600">{receipt.address}</p>
            <p className="text-[10px] text-gray-600">Tel: {receipt.phone}</p>
            {receipt.tin && <p className="text-[10px] text-gray-600">TIN: {receipt.tin}</p>}
          </div>

          <div className="border-t border-dashed border-gray-300 pt-2 mb-2">
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>Receipt: {receipt.receiptNumber}</span>
              <span>{new Date(receipt.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>Cashier: {receipt.cashier}</span>
              <span>{new Date(receipt.date).toLocaleTimeString()}</span>
            </div>
            {receipt.customer && (
              <p className="text-[10px] text-gray-600 mt-1">Customer: {receipt.customer}</p>
            )}
          </div>

          <table className="w-full mb-2">
            <thead>
              <tr className="border-b border-dashed border-gray-300 text-[10px] text-gray-600">
                <th className="text-left py-1">Item</th>
                <th className="text-center py-1">Qty</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-1 truncate max-w-[120px]">{item.name}</td>
                  <td className="text-center py-1">{item.quantity}</td>
                  <td className="text-right py-1">{formatMoney(item.price)}</td>
                  <td className="text-right py-1">{formatMoney(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span>Subtotal</span>
              <span>{formatMoney(receipt.subtotal)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-[10px]">
                <span>Discount</span>
                <span>-{formatMoney(receipt.discount)}</span>
              </div>
            )}
            {receipt.tax > 0 && (
              <div className="flex justify-between text-[10px]">
                <span>Tax</span>
                <span>{formatMoney(receipt.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-gray-300">
              <span>Total</span>
              <span>{formatMoney(receipt.grandTotal)}</span>
            </div>
          </div>

          <div className="text-[10px] text-gray-600 mt-2 space-y-0.5">
            <p>Payment: {receipt.paymentMethod.replace("_", " ").toUpperCase()}</p>
            <p>Paid: {formatMoney(receipt.amountPaid)}</p>
            {receipt.change > 0 && <p>Change: {formatMoney(receipt.change)}</p>}
          </div>

          <div className="flex justify-center mt-3">
            <QRCodeSVG value={receipt.receiptNumber} size={64} />
          </div>

          {receipt.footer && (
            <p className="text-center text-[10px] text-gray-500 mt-3">{receipt.footer}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
            <X className="h-4 w-4" />
            Close
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
