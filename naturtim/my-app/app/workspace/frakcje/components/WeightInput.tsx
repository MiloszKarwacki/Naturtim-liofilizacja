import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface WeightInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  maxWeight?: number;
}

export function WeightInput({
  value,
  onChange,
  error,
  maxWeight
}: WeightInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="weight">
        Waga (kg)
        {maxWeight !== undefined &&
          <span className="text-sm text-gray-500">
            {" "}(max {maxWeight} kg)
          </span>}
      </Label>
      <Input
        id="weight"
        type="number"
        step="0.01"
        min="0"
        max={maxWeight}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={
          maxWeight
            ? `Wprowadź wagę produktu (max ${maxWeight} kg)`
            : "Wprowadź wagę produktu"
        }
        className={error ? "border-red-500" : ""}
      />
      {error &&
        <p className="text-sm text-red-500">
          {error}
        </p>}
    </div>
  );
}
