"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateTimePicker } from "./DateTimePicker";
import { Machine, Delivery } from "../types";
import dayjs from "dayjs";

interface AddProcessFormProps {
  machines: Machine[];
  deliveries: Delivery[];
  selectedMachine: number | "";
  selectedDeliveryId: number | "";
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  error: string | null;
  setSelectedMachine: (id: number | "") => void;
  setSelectedDeliveryId: (id: number | "") => void;
  setStartDate: (date: dayjs.Dayjs | null) => void;
  setEndDate: (date: dayjs.Dayjs | null) => void;
  handleAddProcess: () => void;
}

export const AddProcessForm: React.FC<AddProcessFormProps> = ({
  machines,
  deliveries,
  selectedMachine,
  selectedDeliveryId,
  startDate,
  endDate,
  error,
  setSelectedMachine,
  setSelectedDeliveryId,
  setStartDate,
  setEndDate,
  handleAddProcess
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Wiersz 1: Maszyna i Dostawa (numer partii) */}
          <div className="flex flex-wrap gap-4">
            <div className="w-[200px]">
              <Select
                value={selectedMachine.toString()}
                onValueChange={value => setSelectedMachine(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz maszynę" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map(machine =>
                    <SelectItem
                      key={`machine-${machine.id}`}
                      value={machine.id.toString()}
                    >
                      {machine.name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[250px]">
              <Select
                value={selectedDeliveryId.toString()}
                onValueChange={value => setSelectedDeliveryId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz dostawę" />
                </SelectTrigger>
                <SelectContent>
                  {deliveries.map(delivery =>
                    <SelectItem
                      key={`delivery-${delivery.id}`}
                      value={delivery.id.toString()}
                    >
                      {delivery.batchNumber} - {delivery.product.name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wiersz 2: DateTimePickery i przycisk */}
          <div className="flex flex-wrap gap-4 items-center">
            <DateTimePicker
              date={startDate}
              setDate={setStartDate}
              label="Data rozpoczęcia"
            />
            <DateTimePicker
              date={endDate}
              setDate={setEndDate}
              label="Data zakończenia"
            />
            <Button type="button" onClick={handleAddProcess}>
              Dodaj proces
            </Button>
          </div>
        </div>

        {error &&
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>}
      </CardContent>
    </Card>
  );
};
