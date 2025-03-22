import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { type Batch } from '../hooks/useBatches';

interface BatchSelectProps {
  batches: Batch[];
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export function BatchSelect({ batches, value, onChange, isLoading, error }: BatchSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="batch">Numer partii produkcyjnej</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger id="batch" className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={isLoading ? "Ładowanie partii..." : "Wybierz partię"} />
        </SelectTrigger>
        <SelectContent>
          {batches.map(batch => (
            <SelectItem key={batch.id} value={batch.id.toString()}>
              {batch.batchNumber} {batch.product ? `(${batch.product.name})` : ""}{" "}
              {batch.availableWeight !== undefined && `- dostępne: ${batch.availableWeight} kg`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}