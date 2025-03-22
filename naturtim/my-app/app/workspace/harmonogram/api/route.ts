import { NextRequest, NextResponse } from "next/server";
import { ScheduleService } from "./service";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/auth/utils/auth";
import { logEvent } from "@/lib/logger";

export async function GET() {
  try {
    const data = await ScheduleService.getScheduleData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać danych harmonogramu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Pobieramy dane o zalogowanym użytkowniku
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 });
    }

    const processData = await request.json();
    const result = await ScheduleService.addProcess(processData);

    // Pobierz dane użytkownika z bazy
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    // Przygotuj nazwę użytkownika
    const userName = userData 
      ? `${userData.username || ""} ${userData.userSurname || ""}`.trim() 
      : user.login;

    // Używamy dokładnie tego samego podejścia jak w przyjęciu dostawy
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName,
        description: `Dodano nowy proces liofilizacji: partia ${result.batchNumber}`,
        details: JSON.stringify({
          action: "DODANIE_PROCESU",
          partia: result.batchNumber,
          maszyna: result.machineName,
          czas_trwania: `${result.duration} minut (${(result.duration / 60).toFixed(1)} godzin/y)`,
          data_rozpoczecia: result.startDate ? new Date(result.startDate).toLocaleString('pl-PL') : 'Nieznana data',
          data_zakonczenia: result.endDate ? new Date(result.endDate).toLocaleString('pl-PL') : 'Nieznana data'
        })
      }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding process:", error);
    return NextResponse.json(
      { error: "Nie udało się dodać procesu" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const processData = await request.json();
    const result = await ScheduleService.updateProcess(processData);

    await logEvent(request, "Zaktualizowano proces liofilizacji", { 
      details: JSON.stringify({
        action: "AKTUALIZACJA_PROCESU",
        partia: result.batchNumber,
        maszyna: result.machineName,
        czas_trwania: `${result.duration} minut (${(result.duration / 60).toFixed(1)} godzin/y)`,
        data_rozpoczecia: result.startDate ? new Date(result.startDate).toLocaleString('pl-PL') : 'Nieznana data',
        data_zakonczenia: result.endDate ? new Date(result.endDate).toLocaleString('pl-PL') : 'Nieznana data'
      })
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating process:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować procesu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Pobieramy dane o zalogowanym użytkowniku
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Brakujący parametr id" },
        { status: 400 }
      );
    }
    
    const result = await ScheduleService.deleteProcess(id);

    // Pobierz dane użytkownika z bazy
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    // Przygotuj nazwę użytkownika
    const userName = userData 
      ? `${userData.username || ""} ${userData.userSurname || ""}`.trim() 
      : user.login;

    // Używamy dokładnie tego samego podejścia jak w przyjęciu dostawy
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName,
        description: `Usunięto proces liofilizacji: partia ${result.batchNumber}`,
        details: JSON.stringify({
          action: "USUNIECIE_PROCESU",
          partia: result.batchNumber,
          maszyna: result.machineName,
          czas_trwania: `${result.duration} minut (${(result.duration / 60).toFixed(1)} godzin/y)`
        })
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting process:", error);
    return NextResponse.json(
      { error: error.message || "Nie udało się usunąć procesu" },
      { status: error.message?.includes("nie istnieje") ? 404 : 500 }
    );
  }
} 