import { NextRequest, NextResponse } from "next/server";
import { getRecipients, createRecipient, canDeleteRecipient, deleteRecipient } from "../services/recipientService";

//==================================================== */
// GET - jak proszenie kelnera: "Pokaż mi listę odbiorców" */
//==================================================== */
export async function GET() {
  try {
    // Idziemy do kuchni (bazy danych) i prosimy o listę odbiorców
    const recipients = await getRecipients();
    
    // Dajemy klientowi listę na tacy (JSON)
    return NextResponse.json(recipients);
  } catch (error) {
    // Ups! Kucharz się potknął (wystąpił błąd)
    console.error("Ojoj! Nie mogę znaleźć listy odbiorców:", error);
    return NextResponse.json(
      { message: "Nie udało się przynieść listy odbiorców :(" },
      { status: 500 } // kod 500 to jak mówienie "mamy problem w kuchni"
    );
  }
}

//==================================================== */
// POST - jak mówienie: "Chcę dodać nowego odbiorcę do książki" */
//==================================================== */
export async function POST(request: NextRequest) {
  try {
    // Odczytujemy karteczkę od klienta (body requestu)
    const body = await request.json();
    
    // Sprawdzamy czy klient napisał nazwę odbiorcy
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { message: "Hej! Zapomniałeś podać nazwę odbiorcy!" },
        { status: 400 } // kod 400 to jak mówienie "popraw swoje zamówienie"
      );
    }
    
    // Dodajemy nowego odbiorcę do książki (przekazując request)
    const newRecipient = await createRecipient(body, request);
    
    // Mówimy klientowi "Dodaliśmy nowego odbiorcę!"
    return NextResponse.json(newRecipient, { status: 201 }); // 201 oznacza "stworzyliśmy coś nowego"
  } catch (error) {
    console.error("Ups! Coś poszło nie tak przy dodawaniu odbiorcy:", error);
    return NextResponse.json(
      { message: "Nie udało się dodać odbiorcy :(" },
      { status: 500 }
    );
  }
}

//==================================================== */
// DELETE - jak mówienie: "Chcę wykreślić odbiorcę z mojej książki" */
//==================================================== */
export async function DELETE(request: NextRequest) {
  try {
    // Odczytujemy karteczkę od klienta
    const body = await request.json();
    
    // Sprawdzamy czy klient podał, którego odbiorcę usunąć
    if (!body.id) {
      return NextResponse.json(
        { message: "Hej! Nie wiem którego odbiorcę usunąć - podaj ID!" },
        { status: 400 }
      );
    }
    
    // Sprawdzamy czy możemy usunąć tego odbiorcę (czy nie ma powiązań)
    const canDelete = await canDeleteRecipient(Number(body.id));
    
    if (!canDelete) {
      return NextResponse.json(
        { message: "Nie mogę usunąć tego odbiorcy, bo jest powiązany z partiami produkcyjnymi!" },
        { status: 400 }
      );
    }
    
    // Usuwamy odbiorcę z książki (przekazując request)
    await deleteRecipient(Number(body.id), request);
    
    // Informujemy klienta, że usunęliśmy odbiorcę
    return NextResponse.json({ message: "Odbiorca zniknął z naszej książki!" });
  } catch (error: unknown) {
    console.error("Ajajaj! Problem przy usuwaniu odbiorcy:", error);
    
    // Sprawdzamy czy błąd mówi "nie ma takiego odbiorcy"
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { message: "Nie mogę znaleźć odbiorcy o tym ID - chyba już go nie ma!" },
        { status: 404 } // 404 to jak mówienie "nie ma takiej osoby"
      );
    }
    
    return NextResponse.json(
      { message: "Coś poszło nie tak przy usuwaniu odbiorcy" },
      { status: 500 }
    );
  }
} 