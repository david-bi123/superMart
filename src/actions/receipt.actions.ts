"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { Receipt } from "@/models/Receipt";
import { Sale } from "@/models/Sale";
import { Business } from "@/models/Business";
import mongoose from "mongoose";

function getBusinessId(session: any): string {
  const bid = session?.user?.businessId;
  if (!bid) throw new Error("Not authenticated");
  return bid;
}

export async function getReceipt(saleId: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const sale = await Sale.findOne({
      _id: new mongoose.Types.ObjectId(saleId),
      businessId: new mongoose.Types.ObjectId(businessId),
    })
      .populate("customerId", "name email")
      .populate("userId", "name")
      .lean();

    if (!sale) return { success: false as const, error: "Sale not found" };

    const business = await Business.findById(new mongoose.Types.ObjectId(businessId)).lean();
    if (!business) return { success: false as const, error: "Business not found" };

    const receipt = await Receipt.findOne({
      saleId: new mongoose.Types.ObjectId(saleId),
      businessId: new mongoose.Types.ObjectId(businessId),
    }).lean();

    const receiptData = {
      businessName: business.name,
      businessLogo: business.logo || "",
      address: `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zip}`,
      phone: business.phone,
      tin: business.tin || "",
      cashier: (sale.userId as any)?.name || "System",
      customer: (sale.customerId as any)?.name || "Walk-in Customer",
      items: sale.items.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        total: i.total,
      })),
      subtotal: sale.subtotal,
      discount: sale.discountTotal,
      tax: sale.taxTotal,
      grandTotal: sale.grandTotal,
      paymentMethod: sale.paymentMethod,
      amountPaid: (sale.paymentDetails as any)?.cash || sale.grandTotal,
      change: (sale.paymentDetails as any)?.change || 0,
      receiptNumber: receipt?.receiptNumber || sale.invoiceNumber.replace("INV", "RCP"),
      date: sale.createdAt || new Date(),
      footer: business.settings?.receiptFooter || "Thank you for your purchase!",
    };

    return { success: true as const, data: receiptData };
  } catch (error) {
    console.error("getReceipt error:", error);
    return { success: false as const, error: "Failed to generate receipt" };
  }
}

export async function sendReceiptEmail(saleId: string, email: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const receipt = await Receipt.findOne({
      saleId: new mongoose.Types.ObjectId(saleId),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!receipt) return { success: false as const, error: "Receipt not found" };

    const { default: sendEmail } = await import("@/lib/email/send-email");
    const business = await Business.findById(new mongoose.Types.ObjectId(businessId)).lean();

    await sendEmail.sendReceipt({
      to: email,
      receiptNumber: receipt.receiptNumber,
      businessName: business?.name || "Business",
      grandTotal: receipt.grandTotal,
      receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/receipt/${receipt._id}`,
    });

    receipt.emailedAt = new Date();
    await receipt.save();

    return { success: true as const, data: { emailedAt: receipt.emailedAt.toISOString() } };
  } catch (error) {
    console.error("sendReceiptEmail error:", error);
    return { success: false as const, error: "Failed to send receipt email" };
  }
}

export async function getPublicReceipt(receiptId: string) {
  try {
    await connectDB();

    const receipt = await Receipt.findById(new mongoose.Types.ObjectId(receiptId)).lean();
    if (!receipt) return { success: false as const, error: "Receipt not found" };

    const business = await Business.findById(receipt.businessId).lean();
    if (!business) return { success: false as const, error: "Business not found" };

    const sale = await Sale.findById(receipt.saleId).populate("userId", "name").lean();

    const data = {
      _id: receipt._id.toString(),
      receiptNumber: receipt.receiptNumber,
      businessName: business.name,
      businessLogo: business.logo || "",
      address: `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zip}`,
      phone: business.phone,
      tin: business.tin || "",
      customerName: receipt.customerName || "Walk-in Customer",
      cashier: (sale?.userId as any)?.name || "System",
      items: receipt.items.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        total: i.total,
      })),
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      discount: receipt.discount,
      grandTotal: receipt.grandTotal,
      paymentMethod: receipt.paymentMethod,
      status: sale?.status || "completed",
      verifiedAt: receipt.verifiedAt?.toISOString() || null,
      createdAt: receipt.createdAt?.toISOString(),
      footer: business.settings?.receiptFooter || "Thank you for your purchase!",
    };

    return { success: true as const, data };
  } catch (error) {
    console.error("getPublicReceipt error:", error);
    return { success: false as const, error: "Failed to fetch receipt" };
  }
}

export async function verifyReceipt(receiptId: string) {
  try {
    await connectDB();

    const receipt = await Receipt.findByIdAndUpdate(
      new mongoose.Types.ObjectId(receiptId),
      { $set: { verifiedAt: new Date() } },
      { new: true }
    );

    if (!receipt) return { success: false as const, error: "Receipt not found" };

    return { success: true as const, data: { verifiedAt: receipt.verifiedAt?.toISOString() } };
  } catch (error) {
    console.error("verifyReceipt error:", error);
    return { success: false as const, error: "Failed to verify receipt" };
  }
}
