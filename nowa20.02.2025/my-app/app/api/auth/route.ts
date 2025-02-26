import { NextResponse } from "next/server";
import { AuthService } from "./service";
import jwt from "jsonwebtoken"; // zainstaluj: npm install jsonwebtoken @types/jsonwebtoken

// Oznaczenie, że ten route używa Node.js Runtime
export const runtime = 'nodejs';

// Tajny klucz do podpisywania tokenów JWT (lepiej przenieść do zmiennych środowiskowych)
const JWT_SECRET = process.env.JWT_SECRET || "super-tajny-klucz-jwt";

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();
    
    if (!login || !password) {
      return NextResponse.json(
        { message: "Brakuje nazwy użytkownika lub hasła" },
        { status: 400 }
      );
    }

    const user = await AuthService.login(login, password);
    if (!user) {
      return NextResponse.json(
        { message: "Nieprawidłowe dane logowania" },
        { status: 401 }
      );
    }

    // Generuj token JWT z danymi użytkownika
    const token = jwt.sign(
      { 
        id: user.id, 
        login: user.login, 
        permissions: user.permissions.map(p => p.name) 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    const response = NextResponse.json(
      { message: "Logowanie powiodło się", user, token },
      { status: 200 }
    );

    // Ustaw zarówno starsze cookie jak i nowe z tokenem JWT
    response.cookies.set('user_login', login, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: "Błąd serwera", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { message: 'Wylogowano pomyślnie' },
    { status: 200 }
  );
  
  // Usuń oba ciasteczka
  response.cookies.delete('user_login');
  response.cookies.delete('auth_token');
  
  return response;
} 