import jsPDF from "jspdf";

interface ReceiptData {
  businessName: string;
  businessLogo?: string;
  address: string;
  phone: string;
  tin?: string;
  cashier: string;
  customer?: string;
  items: { name: string; quantity: number; price: number; total: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  receiptNumber: string;
  date: Date;
  footer?: string;
  qrValue?: string;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const doc = new jsPDF({ format: [80, 297], unit: "mm" });
  const pageWidth = 80;
  let y = 10;

  const center = (text: string, size: number = 10, style: string = "normal") => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style as any);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
    y += size * 0.5;
  };

  const left = (text: string, size: number = 8) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", "normal");
    doc.text(text, 4, y);
    y += size * 0.5;
  };

  const right = (label: string, value: string, size: number = 8) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", "normal");
    doc.text(label, 4, y);
    const valueWidth = doc.getTextWidth(value);
    doc.text(value, pageWidth - 4 - valueWidth, y);
    y += size * 0.5;
  };

  const line = () => {
    y += 2;
    doc.setDrawColor(0, 0, 0);
    doc.line(4, y, pageWidth - 4, y);
    y += 4;
  };

  if (data.businessLogo) {
    try {
      const img = new Image();
      img.src = data.businessLogo;
      doc.addImage(img, "JPEG", (pageWidth - 20) / 2, y, 20, 20);
      y += 22;
    } catch {
      // skip image on error
    }
  }

  center(data.businessName, 14, "bold");
  doc.setFontSize(8);
  const lines = doc.splitTextToSize(data.address, pageWidth - 8);
  for (const l of lines) {
    center(l, 8);
  }
  left(`Tel: ${data.phone}`);
  if (data.tin) left(`TIN: ${data.tin}`);
  line();

  left(`Receipt: ${data.receiptNumber}`, 8);
  left(`Date: ${new Date(data.date).toLocaleDateString()} ${new Date(data.date).toLocaleTimeString()}`, 8);
  left(`Cashier: ${data.cashier}`, 8);
  if (data.customer) left(`Customer: ${data.customer}`, 8);
  line();

  doc.setFont("helvetica", "bold");
  left("Item", 8);
  left("Qty    Price    Total", 8);
  doc.setFont("helvetica", "normal");
  y -= 3;

  for (const item of data.items) {
    const itemText = `${item.name} x${item.quantity}`;
    const itemLines = doc.splitTextToSize(itemText, pageWidth - 30);
    for (const l of itemLines) {
      left(l, 7);
    }
    right("", `$${item.total.toFixed(2)}`, 7);
    y -= 1;
  }

  line();

  right("Subtotal:", `$${data.subtotal.toFixed(2)}`, 9);
  if (data.discount > 0) {
    right("Discount:", `-$${data.discount.toFixed(2)}`, 9);
  }
  if (data.tax > 0) {
    right("Tax:", `$${data.tax.toFixed(2)}`, 9);
  }
  right("Total:", `$${data.grandTotal.toFixed(2)}`, 10);
  y += 2;

  left(`Payment: ${data.paymentMethod.replace("_", " ").toUpperCase()}`, 8);
  left(`Paid: $${data.amountPaid.toFixed(2)}`, 8);
  if (data.change > 0) left(`Change: $${data.change.toFixed(2)}`, 8);
  line();

  if (data.qrValue) {
    try {
      const QRCode = require("qrcode");
      const qrDataUrl = await QRCode.toDataURL(data.qrValue, { width: 60, margin: 1 });
      doc.addImage(qrDataUrl, "PNG", (pageWidth - 30) / 2, y, 30, 30);
      y += 32;
    } catch {
      // skip qr on error
    }
  }

  if (data.footer) {
    y += 2;
    doc.setFontSize(8);
    const footerLines = doc.splitTextToSize(data.footer, pageWidth - 8);
    for (const l of footerLines) {
      center(l, 8);
    }
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}

export async function getReceiptBuffer(data: ReceiptData): Promise<Buffer> {
  return generateReceiptPDF(data);
}

export async function getReceiptDataUrl(data: ReceiptData): Promise<string> {
  const doc = await generateReceiptPDF(data);
  return `data:application/pdf;base64,${doc.toString("base64")}`;
}
