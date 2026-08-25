import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      reference,
      items,
      total,
      customerName,
      customerEmail,
      customerPhone,
      address,
      userId,
    } = body;

    if (!reference || !items?.length) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    const amountPaid = verifyData.data.amount / 100;
    if (Math.abs(amountPaid - Number(total)) > 1) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    const existing = await adminDb
      .collection("orders")
      .where("paymentRef", "==", reference)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ orderId: existing.docs[0].id, alreadyExists: true });
    }

    const orderRef = await adminDb.collection("orders").add({
      items,
      total: amountPaid,
      customerName,
      customerEmail,
      customerPhone,
      address: address || "",
      userId: userId || null,
      status: "paid",
      paymentRef: reference,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ orderId: orderRef.id, success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Order failed" },
      { status: 500 }
    );
  }
}