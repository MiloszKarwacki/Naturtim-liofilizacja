import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../services/authService";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, password } = body;
    
    if (!login || !password) {
      return NextResponse.json(
        { message: "Brakuje nazwy użytkownika lub hasła" },
        { status: 400 }
      );
    }

    const user = await AuthService.login(login, password);
    
    if (!user) {
      await AuthService.handleFailedLogin(login);
      
      return NextResponse.json(
        { message: "Nieprawidłowe dane logowania" },
        { status: 401 }
      );
    }

    // Utwórz token i zaloguj pomyślne logowanie
    const token = await AuthService.handleSuccessfulLogin(user);

    const response = NextResponse.json(
      { message: "Logowanie powiodło się", user, token },
      { status: 200 }
    );

    // Ustaw ciasteczka z tokenem JWT
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    return response;
  } catch (error: any) {
    console.error("Błąd podczas logowania:", error);
    return NextResponse.json(
      { message: "Błąd serwera", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (token) {
      await AuthService.logout(token);
    }
    
    const response = NextResponse.json(
      { message: 'Wylogowano pomyślnie' },
      { status: 200 }
    );
    
    // Usuń ciasteczka
    response.cookies.delete('auth_token');
    
    return response;
  } catch (error: any) {
    console.error("Błąd podczas wylogowywania:", error);
    return NextResponse.json(
      { message: "Błąd podczas wylogowywania", error: error.message },
      { status: 500 }
    );
  }
} 