import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Process, Machine, ProcessDialogData } from "../data/sampleData";

export const useGanttChart = () => {
  // Ustawiamy okres wyświetlania na tygodniowy okres zaczynający się od przedwczoraj
  const [startOfPeriod, setStartOfPeriod] = useState(() => dayjs().subtract(2, 'day').startOf('day'));
  const [processes, setProcesses] = useState<Process[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogData, setDialogData] = useState<ProcessDialogData>({
    status: 'PLANNED'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych z API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [processesRes, machinesRes] = await Promise.all([
        fetch("/workspace/wykres/api"),
        fetch("/api/machines")
      ]);

      if (!processesRes.ok || !machinesRes.ok) {
        throw new Error("Problem z pobieraniem danych z serwera");
      }
      
      const processesData = await processesRes.json();
      const machinesData = await machinesRes.json();
      
      setProcesses(processesData.map((p: any) => ({
        ...p,
        startDate: dayjs(p.startDate),
        endDate: dayjs(p.endDate)
      })));
      setMachines(machinesData);
    } catch (err) {
      console.error("Błąd podczas pobierania danych:", err);
      setError("Nie udało się pobrać danych. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
    }
  };

  // Pobieranie danych przy pierwszym renderowaniu
  useEffect(() => {
    fetchData();
  }, []);

  // Automatyczne przesuwanie okresu co 5 minut
  useEffect(() => {
    // Ustaw początkowy okres
    setStartOfPeriod(dayjs().subtract(2, 'day').startOf('day'));
    
    // Ustaw interwał aktualizacji co 5 minut (300000 ms)
    const updateInterval = 5 * 60 * 1000; 
    
    const timer = setInterval(() => {
      console.log("Aktualizuję wykres...");
      setStartOfPeriod(dayjs().subtract(2, 'day').startOf('day'));
      // Odświeżamy też dane przy każdej aktualizacji wykresu
      fetchData();
    }, updateInterval);
    
    // Czyszczenie timera przy odmontowaniu komponentu
    return () => clearInterval(timer);
  }, []); // Pusta tablica zależności - efekt uruchomi się tylko raz przy montowaniu

  // Funkcja pomocnicza do obliczania pozycji i szerokości paska procesu
  const calculateProcessPosition = (process: Process) => {
    const startPeriodTime = startOfPeriod.valueOf();
    const endPeriodTime = startOfPeriod.add(7, 'day').valueOf();
    const processStart = Math.max(process.startDate.valueOf(), startPeriodTime);
    const processEnd = Math.min(process.endDate.valueOf(), endPeriodTime);
    
    const totalWidth = endPeriodTime - startPeriodTime;
    const left = ((processStart - startPeriodTime) / totalWidth) * 100;
    const width = ((processEnd - processStart) / totalWidth) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Funkcja otwierająca modal z danymi procesu
  const handleProcessClick = (process: Process) => {
    setSelectedProcess(process);
    // Prefillujemy daty z procesu, a waga zostaje pusta do wpisania
    setDialogData({
      inputWeight: undefined,
      outputWeight: undefined,
      actualStartDate: process.startDate.toDate(),
      actualEndDate: process.endDate.toDate(),
      status: 'PLANNED'
    });
    setIsModalOpen(true);
  };

  // Aktualizacja danych rozpoczęcia procesu z użyciem API
  const handleUpdateStart = async () => {
    if (!selectedProcess || !dialogData.inputWeight || !dialogData.actualStartDate) return;

    try {
      const payload = {
        id: selectedProcess.id,
        inputWeight: dialogData.inputWeight,
        actualStartDate: dialogData.actualStartDate.toISOString(),
        deliveryId: selectedProcess.deliveryId
      };

      const response = await fetch(`/workspace/wykres/api`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Błąd podczas aktualizacji rozpoczęcia procesu');

      // Pobieramy zaktualizowane dane
      await fetchData();
      setSelectedProcess(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating process start:', error);
      setError("Nie udało się zaktualizować procesu.");
    }
  };

  // Aktualizacja danych zakończenia procesu z użyciem API
  const handleUpdateEnd = async () => {
    if (!selectedProcess || !dialogData.outputWeight || !dialogData.actualEndDate) return;

    try {
      const payload = {
        id: selectedProcess.id,
        outputWeight: dialogData.outputWeight,
        actualEndDate: dialogData.actualEndDate.toISOString(),
        deliveryId: selectedProcess.deliveryId
      };

      const response = await fetch(`/workspace/wykres/api`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Błąd podczas aktualizacji zakończenia procesu');

      // Pobieramy zaktualizowane dane
      await fetchData();
      setSelectedProcess(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating process end:', error);
      setError("Nie udało się zaktualizować procesu.");
    }
  };

  // Całkowita liczba godzin w okresie 7-dniowym
  const totalHours = 7 * 24;
  // Podział co 4 godziny - czyli 6 segmentów na każdy dzień
  const segmentHours = 4;
  const totalSegments = totalHours / segmentHours;

  return {
    startOfPeriod,
    processes,
    machines,
    selectedProcess,
    isModalOpen,
    setIsModalOpen,
    dialogData,
    setDialogData,
    calculateProcessPosition,
    handleProcessClick,
    handleUpdateStart,
    handleUpdateEnd,
    totalHours,
    segmentHours,
    totalSegments,
    loading,
    error
  };
}; 