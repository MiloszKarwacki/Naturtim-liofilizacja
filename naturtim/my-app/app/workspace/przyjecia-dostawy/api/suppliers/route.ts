import { NextResponse } from "next/server";
import { getSuppliers } from "../../services/deliveryService";

export async function GET() {
  try {
    const suppliers = await getSuppliers();
    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error("Błąd pobierania dostawców:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 