import { NextResponse, NextRequest } from "next/server";
import { createDelivery, getDeliveries, mapFormDataToDeliveryInput } from "../services/deliveryService";

export async function GET() {
  try {
    const deliveries = await getDeliveries();
    return NextResponse.json({ deliveries });
  } catch (error: any) {
    console.error("Błąd pobierania dostaw:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Walidacja podstawowych pól
    if (!formData.product || !formData.supplier || formData.weight <= 0 || formData.boxCount <= 0) {
      return NextResponse.json({ 
        error: "Nieprawidłowe dane. Wypełnij wszystkie wymagane pola." 
      }, { status: 400 });
    }
    
    // Konwersja danych formularza na format dla API
    const deliveryInput = mapFormDataToDeliveryInput(formData);
    
    // Tworzenie dostawy – przekazujemy request bezpośrednio
    const createdDelivery = await createDelivery(deliveryInput, request);
    
    return NextResponse.json({ 
      delivery: createdDelivery,
      success: true,
      message: "Dostawa została pomyślnie zarejestrowana"
    });
  } catch (error: any) {
    console.error("Błąd tworzenia dostawy:", error);
    return NextResponse.json({ 
      error: error.message || "Wystąpił błąd podczas tworzenia dostawy"
    }, { status: 500 });
  }
}