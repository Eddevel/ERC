import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const {
      eventId,
      userId,
      userName,
      userEmail,
      quantity = 1,
    } = await req.json();

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: "Missing eventId or userId" },
        { status: 400 }
      );
    }

    const qty = Math.min(Math.max(Number(quantity) || 1, 1), 5);

    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = eventSnap.data()!;

    // Only free events
    if (event.price && event.price > 0) {
      return NextResponse.json(
        { error: "This event requires payment" },
        { status: 400 }
      );
    }

    const spotsLeft = event.capacity - (event.bookedCount || 0);
    if (spotsLeft <= 0) {
      return NextResponse.json({ error: "Event is sold out" }, { status: 400 });
    }

    if (qty > spotsLeft) {
      return NextResponse.json(
        { error: `Only ${spotsLeft} spot(s) left` },
        { status: 400 }
      );
    }

    // Create one ticket document per seat
    const batch = adminDb.batch();
    const ticketIds: string[] = [];

    for (let i = 0; i < qty; i++) {
      const ticketRef = adminDb.collection("tickets").doc();
      ticketIds.push(ticketRef.id);

      batch.set(ticketRef, {
        userId,
        eventId,
        userName: userName || "",
        userEmail: userEmail || "",
        amountPaid: 0,
        quantity: 1,
        status: "valid",
        paymentRef: `FREE-${Date.now()}-${i}`,
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
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Free booking failed" },
      { status: 500 }
    );
  }
}