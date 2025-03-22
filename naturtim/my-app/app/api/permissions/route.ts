import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Pobieranie uprawnień aktualnie zalogowanego użytkownika
export async function GET() {
  try {
    // Pobieramy login z ciasteczka
    const cookieStore = await cookies();
    const login = cookieStore.get('user_login')?.value;

    // Jeśli nie ma loginu, zwracamy puste uprawnienia (bez komunikatu błędu)
    if (!login) {
      return NextResponse.json({ permissions: [] }, { status: 200 });
    }

    // Pobieramy użytkownika z bazy wraz z jego uprawnieniami
    const user = await prisma.user.findUnique({
      where: { login },
      include: { permissions: true }
    });

    // Jeśli nie ma użytkownika, zwracamy błąd
    if (!user) {
      return NextResponse.json(
        { message: "Nie znaleziono użytkownika", permissions: [] },
        { status: 404 }
      );
    }

    // Zwracamy uprawnienia użytkownika
    return NextResponse.json({ permissions: user.permissions || [] });
  } catch (error) {
    console.error('Błąd podczas pobierania uprawnień użytkownika:', error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas pobierania uprawnień", permissions: [] }, 
      { status: 500 }
    );
  }
}

// Dodanie nowego endpointu do pobierania wszystkich dostępnych uprawnień w systemie
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Nie podano ID użytkownika" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { permissions: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Nie znaleziono użytkownika" },
        { status: 404 }
      );
    }

    return NextResponse.json({ permissions: user.permissions });
  } catch (error) {
    console.error('Błąd podczas pobierania uprawnień użytkownika:', error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas pobierania uprawnień" }, 
      { status: 500 }
    );
  }
} 