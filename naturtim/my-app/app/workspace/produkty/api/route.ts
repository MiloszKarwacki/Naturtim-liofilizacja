import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct, canDeleteProduct, deleteProduct } from "../services/productService";

//==================================================== */
// GET - jak proszenie kelnera: "Pokaż mi menu produktów" */
//==================================================== */
export async function GET() {
  try {
    // Idziemy do kuchni (bazy danych) i prosimy o listę produktów
    const products = await getProducts();
    
    // Dajemy klientowi listę na tacy (JSON)
    return NextResponse.json(products);
  } catch (error) {
    // Ups! Kucharz się potknął (wystąpił błąd)
    console.error("Ojoj! Nie mogę znaleźć listy produktów:", error);
    return NextResponse.json(
      { message: "Nie udało się przynieść listy produktów :(" },
      { status: 500 } // kod 500 to jak mówienie "mamy problem w kuchni"
    );
  }
}

//==================================================== */
// POST - jak mówienie: "Chcę dodać nowy produkt do menu" */
//==================================================== */
export async function POST(request: NextRequest) {
  try {
    // Odczytujemy karteczkę od klienta (body requestu)
    const body = await request.json();
    
    // Sprawdzamy czy klient napisał nazwę produktu
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { message: "Hej! Zapomniałeś podać nazwę produktu!" },
        { status: 400 } // kod 400 to jak mówienie "popraw swoje zamówienie"
      );
    }
    
    // Dodajemy nowy produkt do menu
    const newProduct = await createProduct(body, request);
    
    // Mówimy klientowi "Dodaliśmy nowy produkt!"
    return NextResponse.json(newProduct, { status: 201 }); // 201 oznacza "stworzyliśmy coś nowego"
  } catch (error) {
    console.error("Ups! Coś poszło nie tak przy dodawaniu produktu:", error);
    return NextResponse.json(
      { message: "Nie udało się dodać produktu :(" },
      { status: 500 }
    );
  }
}

//==================================================== */
// DELETE - jak mówienie: "Chcę wykreślić produkt z mojego menu" */
//==================================================== */
export async function DELETE(request: NextRequest) {
  try {
    // Odczytujemy karteczkę od klienta
    const body = await request.json();
    
    // Sprawdzamy czy klient podał, który produkt usunąć
    if (!body.id) {
      return NextResponse.json(
        { message: "Hej! Nie wiem który produkt usunąć - podaj ID!" },
        { status: 400 }
      );
    }
    
    // Sprawdzamy czy możemy usunąć ten produkt (czy nie ma powiązań)
    const canDelete = await canDeleteProduct(Number(body.id));
    
    if (!canDelete) {
      return NextResponse.json(
        { message: "Nie mogę usunąć tego produktu, bo jest powiązany z partiami produkcyjnymi!" },
        { status: 400 }
      );
    }
    
    // Usuwamy produkt z menu
    await deleteProduct(Number(body.id), request);
    
    // Informujemy klienta, że usunęliśmy produkt
    return NextResponse.json({ message: "Produkt zniknął z naszego menu!" });
  } catch (error: unknown) {
    console.error("Ajajaj! Problem przy usuwaniu produktu:", error);
    
    // Sprawdzamy czy błąd mówi "nie ma takiego produktu"
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { message: "Nie mogę znaleźć produktu o tym ID - chyba już go nie ma!" },
        { status: 404 } // 404 to jak mówienie "nie ma takiego produktu"
      );
    }
    
    return NextResponse.json(
      { message: "Coś poszło nie tak przy usuwaniu produktu" },
      { status: 500 }
    );
  }
} 