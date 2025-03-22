import React from "react";
import dayjs from "dayjs";
import { Machine, Process } from "../data/sampleData";

interface MachineRowProps {
  machine: Machine;
  processes: Process[];
  startOfPeriod: dayjs.Dayjs;
  totalSegments: number;
  calculateProcessPosition: (process: Process) => { left: string; width: string };
  handleProcessClick: (process: Process) => void;
}

export const MachineRow: React.FC<MachineRowProps> = ({
  machine,
  processes,
  startOfPeriod,
  totalSegments,
  calculateProcessPosition,
  handleProcessClick
}) => {
  return (
    <div className="flex h-16 mb-2 relative hover:bg-slate-50">
      <div className="w-36 py-1">
        {machine.name}
      </div>
      
      <div className="flex-1 relative">
        {/* Linie pomocnicze - siatka co 4 godziny */}
        {Array.from({ length: totalSegments + 1 }).map((_, i) => (
          <div
            key={`segment-${i}`}
            className={`absolute top-0 bottom-0 ${
              i % 6 === 0 ? 'border-l border-slate-300' : 'border-l border-dashed border-slate-200'
            }`}
            style={{ left: `${(i / totalSegments) * 100}%` }}
          />
        ))}

        {/* Procesy */}
        {processes
          .filter(p => p.machineId === machine.id)
          .map(process => {
            const { left, width } = calculateProcessPosition(process);
            // Bazowy kolor maszyny
            let background = machine.color || '#3498db';
            
            // Modyfikujemy kolor w zależności od statusu
            if (process.status === 'STARTED') {
              background = '#f39c12'; // Pomarańczowy dla rozpoczętych
            } else if (process.status === 'COMPLETED') {
              background = '#2ecc71'; // Zielony dla zakończonych
            }
            
            return (
              <div
                key={process.id}
                className={`absolute top-1 bottom-1 rounded flex items-center justify-center text-white text-sm truncate cursor-pointer hover:opacity-90 ${
                  process.status === 'STARTED' ? 'border-2 border-yellow-500' : 
                  process.status === 'COMPLETED' ? 'border-2 border-green-500' : ''
                }`}
                style={{ left, width, backgroundColor: background }}
                title={`${process.delivery?.batchNumber} - ${process.delivery?.product.name}
Status: ${process.status === 'PLANNED' ? 'Zaplanowany' : process.status === 'STARTED' ? 'Rozpoczęty' : 'Zakończony'}
Ilość: ${process.quantity}kg
Start: ${process.startDate.format('HH:mm DD.MM')}
Koniec: ${process.endDate.format('HH:mm DD.MM')}`}
                onClick={() => handleProcessClick(process)}
              >
                {process.delivery?.batchNumber}
                {/* Wskaźnik statusu */}
                {process.status === 'STARTED' && <span className="ml-1">🟠</span>}
                {process.status === 'COMPLETED' && <span className="ml-1">✅</span>}
              </div>
            );
          })}
      </div>
    </div>
  );
}; 