"use client";

import React from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";

interface DateTimePickerProps {
  date: dayjs.Dayjs | null;
  setDate: (date: dayjs.Dayjs | null) => void;
  label: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ date, setDate, label }) => {
  const formattedDate = date ? date.format("DD.MM.YYYY HH:mm") : "Wybierz datę i czas";
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!date) return;
    const [hours, minutes] = e.target.value.split(':');
    const newDate = date.hour(parseInt(hours)).minute(parseInt(minutes));
    setDate(newDate);
  };
  
  return (
    <div className="w-[240px]">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start text-left font-normal mt-1">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedDate}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={date?.toDate()}
              onSelect={(d) => setDate(d ? dayjs(d) : null)}
              initialFocus
            />
            <div className="flex items-center mt-4 border-t pt-4">
              <Clock className="mr-2 h-4 w-4" />
              <Input
                type="time"
                value={date ? date.format("HH:mm") : ""}
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};