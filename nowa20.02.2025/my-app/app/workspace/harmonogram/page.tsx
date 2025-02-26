"use client";

import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/pl";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RecentDeliveries } from "./components/RecentDeliveries";
import { AddProcessForm } from "./components/AddProcessForm";
import { ProcessList } from "./components/ProcessList";
import { useSchedule } from "./hooks/useSchedule";

const HarmonogramPage = () => {
  const {
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
  } = useSchedule();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl font-medium">Wczytywanie danych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold my-8">Harmonogram Liofilizacji</h1>

      {/* Wyświetlamy ostatnie przyjęcia dostawy */}
      <RecentDeliveries deliveries={deliveries} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Formularz i Lista Procesów */}
        <div className="md:col-span-8 space-y-6">
          {/* Formularz */}
          <AddProcessForm
            machines={machines}
            deliveries={deliveries}
            selectedMachine={selectedMachine}
            selectedDeliveryId={selectedDeliveryId}
            startDate={startDate}
            endDate={endDate}
            error={error}
            setSelectedMachine={setSelectedMachine}
            setSelectedDeliveryId={setSelectedDeliveryId}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            handleAddProcess={handleAddProcess}
          />

          {/* Lista procesów na wybrany dzień */}
          <ProcessList
            selectedDate={selectedDate}
            processes={processes}
            deliveries={deliveries}
            machines={machines}
          />
        </div>

        {/* Kalendarz */}
        <div className="md:col-span-4">
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <div className="rounded-md border">
                <Calendar
                  mode="single"
                  selected={selectedDate.toDate()}
                  onSelect={date =>
                    setSelectedDate(date ? dayjs(date) : dayjs())}
                  disabled={false}
                  footer={null}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HarmonogramPage;
