"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Machine, Process, Delivery } from "../types";
import { toast } from "sonner";

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
        console.log("Próbuję pobrać dane harmonogramu...");

        // Używamy globalnego obiektu window do pobrania bazowego URL
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const apiUrl = `${baseUrl}/workspace/harmonogram/api`;
        console.log("URL API:", apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Błąd odpowiedzi API:", response.status, errorText);
          throw new Error(`Błąd podczas pobierania danych: ${response.status}`);
        }

        const data = await response.json();
        console.log("Pobrano dane:", data);

        // Bezpieczna konwersja dat na obiekty dayjs
        const processesWithDayjs = data.processes.map((process: any) => ({
          ...process,
          startDate: process.startDate ? dayjs(process.startDate) : null,
          endDate: process.endDate ? dayjs(process.endDate) : null
        }));

        setDeliveries(data.deliveries || []);
        setMachines(data.machines || []);
        setProcesses(processesWithDayjs);
        setError(null); // Czyszczenie błędu, jeśli był
      } catch (err) {
        console.error("Błąd podczas ładowania danych:", err);
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

      // Używamy pełnej ścieżki URL
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const apiUrl = `${baseUrl}/workspace/harmonogram/api`;

      // Wywołujemy nasze API
      const response = await fetch(apiUrl, {
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

  // Dodajemy nowe funkcje dla obsługi usuwania procesu
  const handleDeleteProcess = async (id: string) => {
    try {
      setLoading(true);

      // Podobnie używamy pełnej ścieżki URL
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const apiUrl = `${baseUrl}/workspace/harmonogram/api?id=${id}`;

      const response = await fetch(apiUrl, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć procesu");
      }

      // Aktualizujemy lokalny stan bez konieczności odświeżania strony
      setProcesses(processes.filter(process => process.id !== id));
      toast.success("Proces został usunięty");
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error("Wystąpił błąd podczas usuwania procesu");
    } finally {
      setLoading(false);
    }
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
    handleAddProcess,
    handleDeleteProcess
  };
};
