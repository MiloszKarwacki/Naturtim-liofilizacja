import { NextResponse } from "next/server";
import { getRecipients } from "../../services/deliveryService";

export async function GET() {
  try {
    const recipients = await getRecipients();
    return NextResponse.json(recipients);
  } catch (error: any) {
    console.error("Błąd pobierania odbiorców:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 