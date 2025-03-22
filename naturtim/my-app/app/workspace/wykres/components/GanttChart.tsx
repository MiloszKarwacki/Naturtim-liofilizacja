import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MachineRow } from "./MachineRow";
import { useGanttChart } from "../hooks/useGanttChart";
import { ProcessDialog } from "./ProcessDialog";

export const GanttChart: React.FC = () => {
  const {
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
    totalSegments,
    loading,
    error
  } = useGanttChart();

  // Wyświetlanie stanu ładowania
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Harmonogram tygodniowy</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-xl font-medium">Wczytywanie harmonogramu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Wyświetlanie błędu
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Harmonogram tygodniowy</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p className="text-xl font-medium">
              {error}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Harmonogram tygodniowy</h1>

      <Card className="overflow-x-auto">
        <CardContent className="p-6">
          {/* Nagłówek z dniami okresu */}
          <div className="flex border-b pb-2 mb-4">
            <div className="w-36">Maszyna</div>
            <div className="flex-1 flex">
              {Array.from({ length: 7 }).map((_, i) =>
                <div key={i} className="flex-1 text-center">
                  {startOfPeriod.add(i, "day").format("dd DD.MM")}
                </div>
              )}
            </div>
          </div>

          {/* Nagłówek z godzinami */}
          <div className="flex border-b pb-2 mb-4">
            <div className="w-36" />
            <div className="flex-1 flex">
              {Array.from({ length: 7 }).map((_, dayIndex) =>
                <div key={`hours-${dayIndex}`} className="flex-1 flex">
                  {Array.from({ length: 6 }).map((_, segIndex) => {
                    const labelHour = startOfPeriod
                      .add(dayIndex * 24 + segIndex * 4, "hour")
                      .format("HH");
                    return (
                      <div
                        key={`hour-label-${dayIndex}-${segIndex}`}
                        className="flex-1 text-xs text-center"
                      >
                        {labelHour}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Komunikat, gdy nie ma procesów */}
          {machines.length === 0 &&
            <div className="text-center py-8 text-gray-500">
              Brak zdefiniowanych maszyn. Dodaj maszyny w panelu
              administracyjnym.
            </div>}

          {/* Komunikat, gdy nie ma procesów */}
          {machines.length > 0 &&
            processes.length === 0 &&
            <div className="text-center py-8 text-gray-500">
              Brak zaplanowanych procesów w tym okresie. Dodaj procesy w
              zakładce Harmonogram.
            </div>}

          {/* Wiersze z maszynami */}
          {machines.map(machine =>
            <MachineRow
              key={machine.id}
              machine={machine}
              processes={processes}
              startOfPeriod={startOfPeriod}
              totalSegments={totalSegments}
              calculateProcessPosition={calculateProcessPosition}
              handleProcessClick={handleProcessClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal edycji procesu */}
      <ProcessDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedProcess={selectedProcess}
        dialogData={dialogData}
        setDialogData={setDialogData}
        handleUpdateStart={handleUpdateStart}
        handleUpdateEnd={handleUpdateEnd}
      />
    </div>
  );
};
