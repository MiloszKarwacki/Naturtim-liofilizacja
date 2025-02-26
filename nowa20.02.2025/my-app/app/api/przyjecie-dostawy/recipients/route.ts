import { NextResponse } from "next/server";
import { dostawyService } from "@/app/api/przyjecie-dostawy/service";

export async function GET() {
  try {
    const recipients = await dostawyService.getRecipients();
    return NextResponse.json(recipients);
  } catch (error) {
    console.error("Błąd podczas pobierania odbiorców:", error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas pobierania odbiorców" },
      { status: 500 }
    );
  }
} 