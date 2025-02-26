"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Machine, Process, Delivery } from "../types";
import { toast } from "sonner";

// Przykładowe dane dla testów - później do usunięcia
const EXAMPLE_MACHINES: Machine[] = [
  { id: 1, name: "Liofilizator A", color: "#4CAF50" },
  { id: 2, name: "Liofilizator B", color: "#2196F3" },
  { id: 3, name: "Liofilizator C", color: "#F44336" }
];

const EXAMPLE_DELIVERIES: Delivery[] = [
  {
    id: 1,
    batchNumber: "LOT-2023-001",
    mroznia: 500,
    createdAt: "2023-11-01T10:00:00Z",
    product: { name: "Truskawki" }
  },
  {
    id: 2,
    batchNumber: "LOT-2023-002",
    mroznia: 750,
    createdAt: "2023-11-05T14:30:00Z",
    product: { name: "Maliny" }
  },
  {
    id: 3,
    batchNumber: "LOT-2023-003",
    mroznia: 800,
    createdAt: "2023-11-10T09:15:00Z",
    product: { name: "Borówki" }
  },
  {
    id: 4,
    batchNumber: "LOT-2023-004",
    mroznia: 1200,
    createdAt: "2023-11-15T11:45:00Z",
    product: { name: "Jabłka" }
  },
  {
    id: 5,
    batchNumber: "LOT-2023-005",
    mroznia: 650,
    createdAt: "2023-11-20T08:00:00Z",
    product: { name: "Gruszki" }
  }
];

const EXAMPLE_PROCESSES: Process[] = [
  {
    id: "1",
    machineId: 1,
    deliveryId: 1,
    startDate: dayjs().subtract(1, "day").hour(8).minute(0),
    endDate: dayjs().subtract(1, "day").hour(16).minute(0)
  },
  {
    id: "2",
    machineId: 2,
    deliveryId: 2,
    startDate: dayjs().hour(10).minute(0),
    endDate: dayjs().hour(18).minute(0)
  },
  {
    id: "3",
    machineId: 3,
    deliveryId: 3,
    startDate: dayjs().add(1, "day").hour(9).minute(0),
    endDate: dayjs().add(1, "day").hour(17).minute(0)
  }
];

export const useSchedule = () => {
  const [selectedMachine, setSelectedMachine] = useState<number | "">("");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | "">("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  // Pobieramy dane z API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/harmonogram");

        if (!response.ok) {
          throw new Error("Błąd podczas pobierania danych");
        }

        const data = await response.json();

        // Konwertujemy daty na obiekty dayjs
        const processesWithDayjs = data.processes.map((process: any) => ({
          ...process,
          startDate: dayjs(process.startDate),
          endDate: dayjs(process.endDate)
        }));

        setDeliveries(data.deliveries);
        setMachines(data.machines);
        setProcesses(processesWithDayjs);
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas ładowania danych");
        toast.error("Nie udało się pobrać danych harmonogramu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sprawdzanie czy daty się nie nakładają dla wybranej maszyny
  const checkDateOverlap = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    machineId: number
  ): boolean => {
    return processes.some(
      process =>
        process.machineId === machineId &&
        ((start.isAfter(process.startDate) &&
          start.isBefore(process.endDate)) ||
          (end.isAfter(process.startDate) && end.isBefore(process.endDate)) ||
          (start.isBefore(process.startDate) && end.isAfter(process.endDate)))
    );
  };

  // Dodawanie nowego procesu
  const handleAddProcess = async () => {
    if (!selectedMachine || !selectedDeliveryId || !startDate || !endDate) {
      setError("Wypełnij wszystkie pola poprawnie");
      return;
    }

    if (startDate.isAfter(endDate)) {
      setError("Data rozpoczęcia musi być wcześniejsza niż data zakończenia");
      return;
    }

    if (checkDateOverlap(startDate, endDate, selectedMachine as number)) {
      setError("Wybrany termin nakłada się na inny proces dla tej maszyny");
      return;
    }

    try {
      setLoading(true);

      // Wywołujemy nasze API
      const response = await fetch("/api/harmonogram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          machineId: selectedMachine,
          deliveryId: selectedDeliveryId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Nie udało się dodać procesu");
      }

      const newProcess = await response.json();

      // Konwertujemy daty na dayjs
      const processWithDayjs = {
        ...newProcess,
        startDate: dayjs(newProcess.startDate),
        endDate: dayjs(newProcess.endDate)
      };

      // Dodajemy do lokalnego stanu
      setProcesses([...processes, processWithDayjs]);
      resetForm();
      setError(null);
      toast.success("Proces został dodany pomyślnie");
    } catch (error) {
      console.error("Error adding process:", error);
      setError("Nie udało się dodać procesu");
      toast.error("Wystąpił błąd podczas dodawania procesu");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMachine("");
    setSelectedDeliveryId("");
    setStartDate(null);
    setEndDate(null);
  };

  return {
    machines,
    deliveries,
    processes,
    loading,
    error,
    selectedDate,
    selectedMachine,
    selectedDeliveryId,
    startDate,
    endDate,
    setSelectedDate,
    setSelectedMachine,
    setSelectedDeliveryId,
    setStartDate,
    setEndDate,
    handleAddProcess
  };
};
