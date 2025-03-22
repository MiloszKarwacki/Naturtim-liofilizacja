import { NextResponse } from "next/server";
import { frakcjeService } from "@/app/workspace/frakcje/services/service";

export async function GET() {
  try {
    const fractions = await frakcjeService.getFractions();
    return NextResponse.json(fractions);
  } catch (error) {
    console.error("Błąd podczas pobierania frakcji:", error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas pobierania frakcji" },
      { status: 500 }
    );
  }
} 