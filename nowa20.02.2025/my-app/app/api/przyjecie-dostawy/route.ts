import { NextResponse } from "next/server";
import { dostawyService } from "@/app/api/przyjecie-dostawy/service";
import { z } from "zod";

// Schemat walidacji dla danych wejściowych
const dostawaSchema = z.object({
  productId: z.number().int().positive(),
  supplierId: z.number().int().positive(),
  recipientId: z.number().optional().nullable(),
  weight: z.number().positive(),
  boxCount: z.number().int().positive(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Pobieramy dane z żądania
    const data = await request.json();
    
    // Walidujemy dane wejściowe
    const validatedData = dostawaSchema.parse(data);
    
    // Wywołujemy serwis do obsługi logiki biznesowej
    const result = await dostawyService.createDostawa(validatedData);
    
    // Zwracamy odpowiedź z utworzoną dostawą
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas przetwarzania przyjęcia dostawy:", error);
    
    // Jeśli to błąd walidacji, zwracamy szczegóły
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Błąd walidacji danych", errors: error.errors },
        { status: 400 }
      );
    }
    
    // Dla innych błędów zwracamy ogólną informację
    return NextResponse.json(
      { message: "Wystąpił błąd podczas przetwarzania żądania" },
      { status: 500 }
    );
  }
} 