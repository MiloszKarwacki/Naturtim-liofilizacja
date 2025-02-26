import { NextResponse } from "next/server";
import { dostawyService } from "@/app/api/przyjecie-dostawy/service";

export async function GET() {
  try {
    const batchNumber = await dostawyService.generateBatchNumber();
    return NextResponse.json({ batchNumber });
  } catch (error) {
    console.error("Błąd podczas generowania numeru partii:", error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas generowania numeru partii" },
      { status: 500 }
    );
  }
} 