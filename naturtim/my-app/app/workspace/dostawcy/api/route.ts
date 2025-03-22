import { NextRequest, NextResponse } from "next/server";
import { getSuppliers, createSupplier, canDeleteSupplier, deleteSupplier } from "../services/supplierService";

//==================================================== */
// GET - jak proszenie kelnera: "Pokaż mi menu dostawców" */
//==================================================== */
export async function GET() {
  try {
    // Idziemy do kuchni (bazy danych) i prosimy o listę dostawców
    const suppliers = await getSuppliers();
    
    // Dajemy klientowi listę na tacy (JSON)
    return NextResponse.json(suppliers);
  } catch (error) {
    // Ups! Kucharz się potknął (wystąpił błąd)
    console.error("Ojoj! Nie mogę znaleźć listy dostawców:", error);
    return NextResponse.json(
      { message: "Nie udało się przynieść listy dostawców :(" },
      { status: 500 } // kod 500 to jak mówienie "mamy problem w kuchni"
    );
  }
}

//==================================================== */
// POST - jak mówienie: "Chcę dodać nowego dostawcę do książki kontaktów" */
//==================================================== */
export async function POST(request: NextRequest) {
  try {
    // Odczytujemy karteczkę od klienta (body requestu)
    const body = await request.json();
    
    // Sprawdzamy czy klient napisał nazwę dostawcy
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { message: "Hej! Zapomniałeś podać nazwę dostawcy!" },
        { status: 400 } // kod 400 to jak mówienie "popraw swoje zamówienie"
      );
    }
    
    // Dodajemy nowego dostawcę do książki (przekazując request)
    const newSupplier = await createSupplier(body, request);
    
    // Mówimy klientowi "Dodaliśmy nowego dostawcę!"
    return NextResponse.json(newSupplier, { status: 201 }); // 201 oznacza "stworzyliśmy coś nowego"
  } catch (error) {
    console.error("Ups! Coś poszło nie tak przy dodawaniu dostawcy:", error);
    return NextResponse.json(
      { message: "Nie udało się dodać dostawcy :(" },
      { status: 500 }
    );
  }
}

//==================================================== */
// DELETE - jak mówienie: "Chcę wykreślić dostawcę z mojej książki" */
//==================================================== */
export async function DELETE(request: NextRequest) {
  try {
    // Odczytujemy karteczkę od klienta
    const body = await request.json();
    
    // Sprawdzamy czy klient podał, którego dostawcę usunąć
    if (!body.id) {
      return NextResponse.json(
        { message: "Hej! Nie wiem którego dostawcę usunąć - podaj ID!" },
        { status: 400 }
      );
    }
    
    // Sprawdzamy czy możemy usunąć tego dostawcę (czy nie ma powiązań)
    const canDelete = await canDeleteSupplier(Number(body.id));
    
    if (!canDelete) {
      return NextResponse.json(
        { message: "Nie mogę usunąć tego dostawcy, bo dostarcza nam produkty!" },
        { status: 400 }
      );
    }
    
    // Usuwamy dostawcę z książki (przekazując request)
    await deleteSupplier(Number(body.id), request);
    
    // Informujemy klienta, że usunęliśmy dostawcę
    return NextResponse.json({ message: "Dostawca zniknął z naszej książki!" });
  } catch (error: unknown) {
    console.error("Ajajaj! Problem przy usuwaniu dostawcy:", error);
    
    // Sprawdzamy czy błąd mówi "nie ma takiego dostawcy"
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { message: "Nie mogę znaleźć dostawcy o tym ID - chyba już go nie ma!" },
        { status: 404 } // 404 to jak mówienie "nie ma takiej osoby"
      );
    }
    
    return NextResponse.json(
      { message: "Coś poszło nie tak przy usuwaniu dostawcy" },
      { status: 500 }
    );
  }
} 