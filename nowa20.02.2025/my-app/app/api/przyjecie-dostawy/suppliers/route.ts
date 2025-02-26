import { NextResponse } from "next/server";
import { dostawyService } from "@/app/api/przyjecie-dostawy/service";

export async function GET() {
  try {
    const suppliers = await dostawyService.getSuppliers();
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Błąd podczas pobierania dostawców:", error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas pobierania dostawców" },
      { status: 500 }
    );
  }
} 