import { NextResponse } from 'next/server';
import { UserService } from './service';

export async function GET() {
  const users = await UserService.getAll();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  if (!data.login || !data.password) {
    return NextResponse.json(
      { error: "Brak wymaganych danych" },
      { status: 400 }
    );
  }

  try {
    const newUser = await UserService.create(data);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Błąd przy tworzeniu użytkownika" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { id, ...updateData } = data;

  try {
    const updatedUser = await UserService.update(id, updateData);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Błąd przy aktualizacji użytkownika" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  
  try {
    await UserService.delete(id);
    return NextResponse.json({ message: "Użytkownik usunięty" });
  } catch (error) {
    return NextResponse.json(
      { error: "Błąd przy usuwaniu użytkownika" },
      { status: 500 }
    );
  }
} 