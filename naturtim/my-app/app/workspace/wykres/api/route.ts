import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { getAuthUser } from "@/app/auth/utils/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Pobieranie procesów z bazy danych
    // Zakładam, że przechowujesz procesy harmonogramu w tabeli ProductionBatch
    const processes = await prisma.productionBatch.findMany({
      where: {
        // Filtrujemy tylko partie, które mają zaplanowaną datę liofilizacji
        lyophilizationStartDate: { not: null },
        lyophilizationEndDate: { not: null }
      },
      include: {
        // Dołączamy powiązane dane
        product: true,
        Machine: true,
      }
    });

    // Dodajmy sprawdzenie duplikatów
    const processIds = new Set();
    const formattedProcesses = processes
      .filter(process => {
        // Jeśli ID już istnieje w secie, to jest to duplikat - odfiltrujemy go
        if (processIds.has(process.id.toString())) {
          console.warn(`Znaleziono duplikat procesu o ID ${process.id}`);
          return false;
        }
        // Dodaj ID do seta i zachowaj ten proces
        processIds.add(process.id.toString());
        return true;
      })
      .map(process => {
        // Określamy status procesu na podstawie dostępnych danych
        let status = 'PLANNED';
        
        if (process.initialWeight && process.lyophilizationStartDate) {
          status = 'STARTED';
          
          if (process.postLyophilizationWeight && process.lyophilizationEndDate) {
            status = 'COMPLETED';
          }
        }
        
        return {
          id: process.id.toString(),
          machineId: process.machineId || 0,
          deliveryId: process.id,
          quantity: process.initialWeight || 0,
          startDate: process.lyophilizationStartDate,
          endDate: process.lyophilizationEndDate,
          machine: process.Machine,
          status: status, // Dodajemy status procesu
          delivery: {
            batchNumber: process.batchNumber,
            product: {
              name: process.product?.name || "Nieznany produkt"
            }
          }
        };
      });

    return NextResponse.json(formattedProcesses);
  } catch (error) {
    console.error("Błąd podczas pobierania procesów:", error);
    return NextResponse.json(
      { error: "Wystąpił problem podczas pobierania danych" },
      { status: 500 }
    );
  }
}

// Endpoint do aktualizacji procesu
export async function PUT(request: NextRequest) {
  try {
    // Pobieramy dane o zalogowanym użytkowniku
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 });
    }

    const data = await request.json();
    const { id, actualStartDate, actualEndDate, inputWeight, outputWeight } = data;
    
    // Pobierz aktualny stan partii przed aktualizacją
    const currentBatch = await prisma.productionBatch.findUnique({
      where: { id: parseInt(id) },
      include: {
        Machine: true,
        product: true
      }
    });
    
    if (!currentBatch) {
      return NextResponse.json({ error: "Nie znaleziono partii" }, { status: 404 });
    }
    
    // Pobierz dane użytkownika z bazy
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    // Przygotuj nazwę użytkownika
    const userName = userData 
      ? `${userData.username || ""} ${userData.userSurname || ""}`.trim() 
      : user.login;
    
    // Aktualizujemy tylko te pola, które zostały przesłane
    const updateData: any = {};
    
    // ---- ROZPOCZĘCIE PROCESU LIOFILIZACJI ----
    if (actualStartDate && (!currentBatch.lyophilizationStartDate || 
        new Date(actualStartDate).getTime() !== new Date(currentBatch.lyophilizationStartDate).getTime())) {
      
      updateData.lyophilizationStartDate = new Date(actualStartDate);
      
      // Jeśli podano wagę wejściową, aktualizujemy ją i zmniejszamy zapas w mroźni
      if (inputWeight) {
        const parsedInputWeight = parseFloat(inputWeight);
        updateData.initialWeight = parsedInputWeight;
        
        // Odejmujemy wagę z mroźni
        const currentFreezerWeight = currentBatch.mroznia || 0;
        updateData.mroznia = Math.max(0, currentFreezerWeight - parsedInputWeight);
        
        // Zapisujemy log rozpoczęcia procesu z informacją o przesunięciu surowca
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userName,
            description: `Rozpoczęto proces liofilizacji: partia ${currentBatch.batchNumber}`,
            details: JSON.stringify({
              action: "ROZPOCZECIE_LIOFILIZACJI",
              partia: currentBatch.batchNumber,
              maszyna: currentBatch.Machine?.name || "Nieznana maszyna",
              waga_wejściowa: `${parsedInputWeight} kg`,
              pozostało_w_mroźni: `${updateData.mroznia} kg`,
              data_rozpoczęcia: new Date(actualStartDate).toLocaleString('pl-PL')
            })
          }
        });
      } else {
        // Zapisujemy log tylko o aktualizacji czasu rozpoczęcia
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userName,
            description: `Aktualizacja czasu rozpoczęcia liofilizacji: partia ${currentBatch.batchNumber}`,
            details: JSON.stringify({
              action: "AKTUALIZACJA_CZASU_ROZPOCZECIA",
              partia: currentBatch.batchNumber,
              maszyna: currentBatch.Machine?.name || "Nieznana maszyna",
              data_rozpoczęcia: new Date(actualStartDate).toLocaleString('pl-PL')
            })
          }
        });
      }
    }
    
    // ---- ZAKOŃCZENIE PROCESU LIOFILIZACJI ----
    if (actualEndDate && (!currentBatch.lyophilizationEndDate || 
        new Date(actualEndDate).getTime() !== new Date(currentBatch.lyophilizationEndDate).getTime())) {
      
      updateData.lyophilizationEndDate = new Date(actualEndDate);
      
      // Jeśli podano wagę wyjściową, aktualizujemy ją i dodajemy do półproduktu
      if (outputWeight) {
        const parsedOutputWeight = parseFloat(outputWeight);
        updateData.postLyophilizationWeight = parsedOutputWeight;
        
        // Dodajemy wagę do magazynu półproduktu
        updateData.polprodukt = (currentBatch.polprodukt || 0) + parsedOutputWeight;
        
        // Obliczanie procentu suchej masy, jeśli mamy wagę wejściową
        if (currentBatch.initialWeight) {
          updateData.dryMassPercentage = (parsedOutputWeight / currentBatch.initialWeight) * 100;
        }
        
        // Zapisujemy log zakończenia procesu z informacją o przesunięciu produktu
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userName,
            description: `Zakończono proces liofilizacji: partia ${currentBatch.batchNumber}`,
            details: JSON.stringify({
              action: "ZAKONCZENIE_LIOFILIZACJI",
              partia: currentBatch.batchNumber,
              maszyna: currentBatch.Machine?.name || "Nieznana maszyna",
              waga_wyjściowa: `${parsedOutputWeight} kg`,
              przeniesiono_do_półproduktu: `${parsedOutputWeight} kg`,
              sucha_masa: updateData.dryMassPercentage ? `${updateData.dryMassPercentage.toFixed(2)}%` : "Nie obliczono",
              data_zakończenia: new Date(actualEndDate).toLocaleString('pl-PL')
            })
          }
        });
      } else {
        // Zapisujemy log tylko o aktualizacji czasu zakończenia
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userName,
            description: `Aktualizacja czasu zakończenia liofilizacji: partia ${currentBatch.batchNumber}`,
            details: JSON.stringify({
              action: "AKTUALIZACJA_CZASU_ZAKONCZENIA",
              partia: currentBatch.batchNumber,
              maszyna: currentBatch.Machine?.name || "Nieznana maszyna",
              data_zakończenia: new Date(actualEndDate).toLocaleString('pl-PL')
            })
          }
        });
      }
    }
    
    // Aktualizacja w bazie danych
    const updatedBatch = await prisma.productionBatch.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    return NextResponse.json(updatedBatch);
  } catch (error) {
    console.error("Błąd podczas aktualizacji procesu:", error);
    return NextResponse.json(
      { error: "Wystąpił problem podczas aktualizacji danych" },
      { status: 500 }
    );
  }
} 