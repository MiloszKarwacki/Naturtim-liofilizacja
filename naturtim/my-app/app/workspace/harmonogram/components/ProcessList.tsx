"use client";

import React from "react";
import dayjs from "dayjs";
import { Card, CardContent } from "@/components/ui/card";
import { Process, Delivery, Machine } from "../types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

interface ProcessListProps {
  selectedDate: dayjs.Dayjs;
  processes: Process[];
  deliveries: Delivery[];
  machines: Machine[];
  onDeleteProcess?: (id: string) => void;
  onEditProcess?: (process: Process) => void;
}

export const ProcessList: React.FC<ProcessListProps> = ({
  selectedDate,
  processes,
  deliveries,
  machines,
  onDeleteProcess,
  onEditProcess
}) => {
  // Filtrowanie procesów dla wybranego dnia
  const getDayProcesses = (date: dayjs.Dayjs) => {
    return processes.filter((process) => {
      const processDate = dayjs(process.startDate);
      return (
        processDate.date() === date.date() &&
        processDate.month() === date.month() &&
        processDate.year() === date.year()
      );
    });
  };
  
  const dayProcesses = getDayProcesses(selectedDate);

  // Obsługa usuwania procesu
  const handleDelete = async (id: string) => {
    if (onDeleteProcess) {
      // Jeśli mamy handler z rodzica, używamy go
      onDeleteProcess(id);
    } else {
      // Fallback - obsługa bezpośrednio w komponencie
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const apiUrl = `${baseUrl}/workspace/harmonogram/api?id=${id}`;
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Nie udało się usunąć procesu');
        }
        
        toast.success("Proces został usunięty");
        
        // Lepiej byłoby zaktualizować stan bez odświeżania strony
        window.location.reload();
      } catch (error) {
        console.error("Error deleting process:", error);
        toast.error("Wystąpił błąd podczas usuwania procesu");
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">
          Procesy na {selectedDate.format("DD.MM.YYYY")}
        </h3>
        <div className="space-y-2">
          {dayProcesses.map((process) => {
            // Jeśli z API dostaliśmy relacje, wykorzystujemy je, w przeciwnym razie szukamy lokalnie
            const delivery =
              process.delivery ||
              deliveries.find((d) => d.id === process.deliveryId);
            const machine =
              process.machine ||
              machines.find((m) => m.id === process.machineId);
            
            return (
              <div
                key={`process-${process.id}`}
                className="p-4 border rounded-md"
                style={{ borderColor: machine?.color || "gray" }}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {machine?.name} -{" "}
                      {delivery
                        ? `${delivery.batchNumber} (${delivery.product.name})`
                        : "Nieznana dostawa"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {process.startDate.format("HH:mm")} -{" "}
                      {process.endDate.format("HH:mm")}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {onEditProcess ? (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEditProcess(process)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    
                    {/* Pokazujemy przycisk usuwania TYLKO dla procesów w statusie PLANNED */}
                    {(!process.status || process.status === 'PLANNED') && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(process.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {dayProcesses.length === 0 ? (
            <p className="text-muted-foreground">Brak procesów na ten dzień</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}; 