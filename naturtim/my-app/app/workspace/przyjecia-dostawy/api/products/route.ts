import { NextResponse } from "next/server";
import { getProducts } from "../../services/deliveryService";

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Błąd pobierania produktów:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 