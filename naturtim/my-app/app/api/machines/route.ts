import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const machines = await prisma.machine.findMany();
    return NextResponse.json(machines);
  } catch (error) {
    console.error("Błąd podczas pobierania maszyn:", error);
    return NextResponse.json(
      { error: "Wystąpił problem podczas pobierania danych" },
      { status: 500 }
    );
  }
} 