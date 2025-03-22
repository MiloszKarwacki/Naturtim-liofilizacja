import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/app/auth/utils/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    
    // Sprawdź tylko czy jest zalogowany (jakikolwiek użytkownik)
    if (!user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 });
    }
    
    // Reszta jest prosta - pobierz parametry
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get('searchTerm');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortDirection = searchParams.get('sortDirection') || 'desc'; // Nowy parametr sortowania
    
    // Filtrowanie
    const where: any = {};
    
    // Jeśli mamy searchTerm, szukamy zarówno w nazwie użytkownika jak i w szczegółach (numer partii)
    if (searchTerm) {
      where.OR = [
        { userName: { contains: searchTerm } },
        { details: { contains: searchTerm } } // Szukamy w JSON z detalami
      ];
    }
    
    // Filtrowanie po datach zostaje bez zmian
    if (fromDate) where.timestamp = { ...(where.timestamp || {}), gte: new Date(fromDate) };
    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      where.timestamp = { ...(where.timestamp || {}), lte: endDate };
    }
    
    // Pobierz dane z nowym sortowaniem
    const totalCount = await prisma.auditLog.count({ where });
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: sortDirection as 'asc' | 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return NextResponse.json({
      data: logs,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        pageCount: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas pobierania zdarzeń' }, { status: 500 });
  }
} 