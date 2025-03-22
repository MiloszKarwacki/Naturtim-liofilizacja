import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { type Fraction } from '../hooks/useFraction';

interface FractionSelectProps {
  fractions: Fraction[];
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export function FractionSelect({ fractions, value, onChange, isLoading, error }: FractionSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="fraction">Frakcja</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger id="fraction" className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={isLoading ? "Ładowanie frakcji..." : "Wybierz frakcję"} />
        </SelectTrigger>
        <SelectContent>
          {fractions.map(fraction => (
            <SelectItem key={fraction.id} value={fraction.id.toString()}>
              {fraction.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}