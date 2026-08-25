import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, eventId, userId, userName, userEmail, quantity = 1 } =
      body;


    if (!reference || !eventId || !userId) {
      return NextResponse.json(
        { error: "Missing reference, eventId, or userId" },
        { status: 400 }
      );
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Server misconfigured: PAYSTACK_SECRET_KEY" },
        { status: 500 }
      );
    }

    // 1) Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      }
    );
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful", details: verifyData },
        { status: 400 }
      );
    }

    const amountPaid = (verifyData.data.amount || 0) / 100;
    const qty = Math.min(Math.max(Number(quantity) || 1, 1), 5);

    // 2) Prevent duplicate tickets for same payment
    const existing = await adminDb
      .collection("tickets")
      .where("paymentRef", "==", reference)
      .limit(1)
      .get();

    if (!existing.empty) {
      const t = existing.docs[0];
      return NextResponse.json({
        ticketId: t.id,
        ticketIds: [t.id],
        alreadyExists: true,
      });
    }

    // 3) Load event
    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const event = eventSnap.data()!;

    // 4) Create ticket(s)
    const batch = adminDb.batch();
    const ticketIds: string[] = [];
    const perTicketAmount = amountPaid / qty;

    for (let i = 0; i < qty; i++) {
      const ticketRef = adminDb.collection("tickets").doc();
      ticketIds.push(ticketRef.id);
      batch.set(ticketRef, {
        userId,
        eventId,
        userName: userName || "",
        userEmail: userEmail || "",
        amountPaid: perTicketAmount,
        quantity: 1,
        status: "valid",
        paymentRef: reference,
        paidAt: new Date().toISOString(),
        usedAt: null,
        eventTitle: event.title || "",
      });
    }

    batch.update(eventRef, {
      bookedCount: FieldValue.increment(qty),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      ticketId: ticketIds[0],
      ticketIds,
    });
  } catch (err: any) {
    console.error("VERIFY ERROR", err);
    return NextResponse.json(
      { error: err?.message || "Verification failed" },
      { status: 500 }
    );
  }
}