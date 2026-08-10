import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { reference, eventId, userId, userName, userEmail } =
      await req.json();

    if (!reference || !eventId || !userId) {
      return NextResponse.json(
        { error: "Missing reference, eventId, or userId" },
        { status: 400 }
      );
    }

    // 1. Verify with Paystack
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
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    const amountPaid = verifyData.data.amount / 100; // kobo → Naira

    // 2. Load event
    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const event = eventSnap.data()!;

    if (event.bookedCount >= event.capacity) {
      return NextResponse.json({ error: "Event is sold out" }, { status: 400 });
    }

    // 3. Prevent duplicate ticket for same payment
    const existing = await adminDb
      .collection("tickets")
      .where("paymentRef", "==", reference)
      .limit(1)
      .get();

    if (!existing.empty) {
      const t = existing.docs[0];
      return NextResponse.json({
        ticketId: t.id,
        alreadyExists: true,
      });
    }

    // 4. Create ticket + increment bookedCount
    const ticketRef = adminDb.collection("tickets").doc();
    const ticketId = ticketRef.id;

    const batch = adminDb.batch();

    batch.set(ticketRef, {
      userId,
      eventId,
      userName: userName || "",
      userEmail: userEmail || "",
      amountPaid,
      status: "valid",
      paymentRef: reference,
      paidAt: new Date().toISOString(),
      usedAt: null,
      eventTitle: event.title || "",
    });

    batch.update(eventRef, {
      bookedCount: FieldValue.increment(1),
    });

    await batch.commit();

    return NextResponse.json({ ticketId, success: true });
  } catch (err: any) {
    console.error("Paystack verify error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed" },
      { status: 500 }
    );
  }
}