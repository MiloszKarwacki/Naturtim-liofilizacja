import { NextResponse } from "next/server";
import { generateBatchNumber } from "../../services/batchNumberService";

export async function GET() {
  try {
    const batchNumber = await generateBatchNumber();
    return NextResponse.json({ batchNumber });
  } catch (error: any) {
    console.error("Błąd generowania numeru partii:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}