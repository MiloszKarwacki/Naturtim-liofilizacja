import { NextResponse } from 'next/server';
import { getFrozenProducts, updateFrozenProduct } from '../services/service';
import { FrozenProductUpdateData } from '../types/types';

export async function GET() {
  try {
    const frozenProducts = await getFrozenProducts();
    return NextResponse.json(frozenProducts);
  } catch (error) {
    console.error("Błąd podczas pobierania danych z mroźni:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać danych z mroźni" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as FrozenProductUpdateData;
    const { deliveryId, newQuantity } = body;

    if (!deliveryId || newQuantity === undefined) {
      return NextResponse.json(
        { error: "Brak wymaganych danych" },
        { status: 400 }
      );
    }

    const updatedBatch = await updateFrozenProduct(deliveryId, newQuantity);
    return NextResponse.json({ success: true, data: updatedBatch });
  } catch (error) {
    console.error("Błąd podczas aktualizacji danych w mroźni:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować danych w mroźni" },
      { status: 500 }
    );
  }
} 