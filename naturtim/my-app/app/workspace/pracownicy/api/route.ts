import { NextRequest, NextResponse } from "next/server";
import { userService } from "../services/userService";

//==================================================== */
// GET - pobierz wszystkich pracowników */
//==================================================== */
export async function GET() {
  try {
    // Pobieramy listę wszystkich pracowników
    const users = await userService.getAll();
    
    // Zwracamy listę jako JSON
    return NextResponse.json(users);
  } catch (error) {
    // Logujemy błąd i zwracamy odpowiedź z kodem 500
    console.error("Błąd podczas pobierania listy pracowników:", error);
    return NextResponse.json(
      { message: "Nie udało się pobrać listy pracowników" },
      { status: 500 }
    );
  }
}

//==================================================== */
// POST - dodaj nowego pracownika */
//==================================================== */
export async function POST(request: NextRequest) {
  try {
    // Odczytujemy dane z requestu
    const data = await request.json();
    
    // Podstawowa walidacja
    if (!data.login || !data.password) {
      return NextResponse.json(
        { message: "Brak wymaganych danych (login i hasło są obowiązkowe)" },
        { status: 400 }
      );
    }
    
    // Sprawdzamy czy login ma minimum 3 znaki
    if (data.login.trim().length < 3) {
      return NextResponse.json(
        { message: "Login musi mieć co najmniej 3 znaki" },
        { status: 400 }
      );
    }
    
    // Sprawdzamy czy hasło ma minimum 6 znaków
    if (data.password.length < 6) {
      return NextResponse.json(
        { message: "Hasło musi mieć co najmniej 6 znaków" },
        { status: 400 }
      );
    }
    
    // Tworzymy nowego pracownika (przekazując request)
    const newUser = await userService.create(data, request);
    
    // Zwracamy utworzonego pracownika
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas tworzenia pracownika:", error);
    
    // Sprawdzamy czy to błąd unikalności - np. login już istnieje
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { message: "Pracownik o podanym loginie już istnieje" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Nie udało się utworzyć pracownika" },
      { status: 500 }
    );
  }
}

//==================================================== */
// PUT - aktualizuj dane pracownika */
//==================================================== */
export async function PUT(request: NextRequest) {
  try {
    // Odczytujemy dane z requestu
    const data = await request.json();
    const { id, ...updateData } = data;
    
    // Sprawdzamy czy podano ID
    if (!id) {
      return NextResponse.json(
        { message: "Brak ID pracownika do aktualizacji" },
        { status: 400 }
      );
    }
    
    // Aktualizujemy dane pracownika (przekazując request)
    const updatedUser = await userService.update(Number(id), updateData, request);
    
    // Zwracamy zaktualizowane dane
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Błąd podczas aktualizacji pracownika:", error);
    
    // Sprawdzamy czy to błąd "nie znaleziono użytkownika"
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { message: "Nie znaleziono pracownika o podanym ID" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Nie udało się zaktualizować danych pracownika" },
      { status: 500 }
    );
  }
}

//==================================================== */
// DELETE - usuń pracownika */
//==================================================== */
export async function DELETE(request: NextRequest) {
  try {
    // Odczytujemy ID z requestu
    const { id } = await request.json();
    
    // Sprawdzamy czy podano ID
    if (!id) {
      return NextResponse.json(
        { message: "Brak ID pracownika do usunięcia" },
        { status: 400 }
      );
    }
    
    // Usuwamy pracownika (przekazując request)
    await userService.delete(Number(id), request);
    
    // Zwracamy potwierdzenie usunięcia
    return NextResponse.json({ message: "Pracownik został usunięty" });
  } catch (error) {
    console.error("Błąd podczas usuwania pracownika:", error);
    
    // Sprawdzamy czy to błąd "nie znaleziono użytkownika"
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { message: "Nie znaleziono pracownika o podanym ID" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Nie udało się usunąć pracownika" },
      { status: 500 }
    );
  }
} 