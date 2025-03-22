import React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Process, ProcessDialogData } from "../data/sampleData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Formatowanie czasu w przyjazny sposób
const formatDateDisplay = (date: Date | null) => {
  if (!date) return "";
  return format(date, "dd.MM.yyyy HH:mm", { locale: pl });
};

interface ProcessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProcess: Process | null;
  dialogData: ProcessDialogData;
  setDialogData: React.Dispatch<React.SetStateAction<ProcessDialogData>>;
  handleUpdateStart: () => void;
  handleUpdateEnd: () => void;
}

export const ProcessDialog: React.FC<ProcessDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedProcess,
  dialogData,
  setDialogData,
  handleUpdateStart,
  handleUpdateEnd
}) => {
  // Funkcja do ustawiania godziny w wybranej dacie
  const setTime = (date: Date | null | undefined, hours: number, minutes: number) => {
    if (!date) return null;
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    return newDate;
  };

  // Pobieranie godziny i minut z daty
  const getHours = (date: Date | null | undefined) => date ? date.getHours() : 0;
  const getMinutes = (date: Date | null | undefined) => date ? date.getMinutes() : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Proces liofilizacji - {selectedProcess?.delivery?.batchNumber}
          </DialogTitle>
          <DialogDescription>
            {selectedProcess?.delivery?.product.name || ""}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-8 mt-4">
          {/* Lewy panel - aktualizacja rozpoczęcia */}
          <div className="border-r pr-6">
            <h3 className="text-lg font-semibold mb-4">Rozpoczęcie procesu</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Waga surowca (wejście)
                </label>
                <Input
                  type="number"
                  value={dialogData.inputWeight || ''}
                  onChange={(e) =>
                    setDialogData({
                      ...dialogData,
                      inputWeight: e.target.value ? parseFloat(e.target.value) : undefined
                    })
                  }
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Faktyczna data rozpoczęcia
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dialogData.actualStartDate ? (
                        format(dialogData.actualStartDate, "dd.MM.yyyy", { locale: pl })
                      ) : (
                        <span>Wybierz datę</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dialogData.actualStartDate || undefined}
                      onSelect={(date) => setDialogData({ ...dialogData, actualStartDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Dodajemy pole do ustawiania godziny */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Godzina
                  </label>
                  <Select
                    value={getHours(dialogData.actualStartDate)?.toString()}
                    onValueChange={(value) => 
                      setDialogData({
                        ...dialogData,
                        actualStartDate: setTime(
                          dialogData.actualStartDate,
                          parseInt(value),
                          getMinutes(dialogData.actualStartDate)
                        )
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Godz." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={`hour-${i}`} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Minuta
                  </label>
                  <Select
                    value={getMinutes(dialogData.actualStartDate)?.toString()}
                    onValueChange={(value) => 
                      setDialogData({
                        ...dialogData,
                        actualStartDate: setTime(
                          dialogData.actualStartDate,
                          getHours(dialogData.actualStartDate),
                          parseInt(value)
                        )
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min." />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 15, 30, 45].map((min) => (
                        <SelectItem key={`min-${min}`} value={min.toString()}>
                          {min.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                className="w-full"
                disabled={!dialogData.inputWeight || !dialogData.actualStartDate}
                onClick={handleUpdateStart}
              >
                Zatwierdź rozpoczęcie
              </Button>
            </div>
          </div>
          
          {/* Prawy panel - aktualizacja zakończenia */}
          <div className="pl-2">
            <h3 className="text-lg font-semibold mb-4">Zakończenie procesu</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Waga produktu (wyjście)
                </label>
                <Input
                  type="number"
                  value={dialogData.outputWeight || ''}
                  onChange={(e) =>
                    setDialogData({
                      ...dialogData,
                      outputWeight: e.target.value ? parseFloat(e.target.value) : undefined
                    })
                  }
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Faktyczna data zakończenia
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dialogData.actualEndDate ? (
                        format(dialogData.actualEndDate, "dd.MM.yyyy", { locale: pl })
                      ) : (
                        <span>Wybierz datę</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dialogData.actualEndDate || undefined}
                      onSelect={(date) => setDialogData({ ...dialogData, actualEndDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Dodajemy pole do ustawiania godziny */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Godzina
                  </label>
                  <Select
                    value={getHours(dialogData.actualEndDate)?.toString()}
                    onValueChange={(value) => 
                      setDialogData({
                        ...dialogData,
                        actualEndDate: setTime(
                          dialogData.actualEndDate,
                          parseInt(value),
                          getMinutes(dialogData.actualEndDate)
                        )
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Godz." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={`hour-end-${i}`} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Minuta
                  </label>
                  <Select
                    value={getMinutes(dialogData.actualEndDate)?.toString()}
                    onValueChange={(value) => 
                      setDialogData({
                        ...dialogData,
                        actualEndDate: setTime(
                          dialogData.actualEndDate,
                          getHours(dialogData.actualEndDate),
                          parseInt(value)
                        )
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min." />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 15, 30, 45].map((min) => (
                        <SelectItem key={`min-end-${min}`} value={min.toString()}>
                          {min.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!dialogData.outputWeight || !dialogData.actualEndDate}
                onClick={handleUpdateEnd}
              >
                Zatwierdź zakończenie
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 