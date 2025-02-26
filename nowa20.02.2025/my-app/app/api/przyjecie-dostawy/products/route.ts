import { NextResponse } from "next/server";
import { dostawyService } from "@/app/api/przyjecie-dostawy/service";

export async function GET() {
  try {
    const products = await dostawyService.getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Błąd podczas pobierania produktów:", error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas pobierania produktów" },
      { status: 500 }
    );
  }
} 