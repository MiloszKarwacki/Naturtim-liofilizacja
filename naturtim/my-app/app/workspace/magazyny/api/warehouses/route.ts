import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Pobieranie wszystkich magazynów
export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: { warehouseFractions: true }
        }
      }
    });
    
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("Błąd podczas pobierania magazynów:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać magazynów" },
      { status: 500 }
    );
  }
}