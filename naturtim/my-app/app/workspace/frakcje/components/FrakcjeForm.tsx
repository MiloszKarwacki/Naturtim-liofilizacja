import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchSelect } from "./BatchSelect";
import { FractionSelect } from "./FractionSelect";
import { WeightInput } from "./WeightInput";
import { useBatches } from "../hooks/useBatches";
import { useFractions } from "../hooks/useFraction";
import { useAssignFraction } from "../hooks/useAssignFraction";
import { toast } from "@/hooks/use-toast";

export function FrakcjaForm() {
  // Stan formularza
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedFraction, setSelectedFraction] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  // Walidacja formularza
  const [formErrors, setFormErrors] = useState({
    batch: "",
    fraction: "",
    weight: ""
  });

  // Hooki do pobierania danych i obsługi zapisu
  const {
    batches,
    isLoading: batchesLoading,
    error: batchesError
  } = useBatches();
  const {
    fractions,
    isLoading: fractionsLoading,
    error: fractionsError
  } = useFractions();
  const { assignFraction, isLoading: assignLoading } = useAssignFraction();

  // Sprawdzenie czy formularz się ładuje
  const isLoading = batchesLoading || fractionsLoading || assignLoading;

  // Znalezienie wybranej partii – żeby wiedzieć, ile surowca mamy dostępnego
  const selectedBatchData = batches.find(batch => batch.id.toString() === selectedBatch);

  // Walidacja formularza
  const validateForm = () => {
    const errors = {
      batch: "",
      fraction: "",
      weight: ""
    };
    let isValid = true;

    if (!selectedBatch) {
      errors.batch = "Wybierz partię produkcyjną";
      isValid = false;
    }

    if (!selectedFraction) {
      errors.fraction = "Wybierz frakcję";
      isValid = false;
    }

    if (!weight) {
      errors.weight = "Wprowadź wagę produktu";
      isValid = false;
    } else if (parseFloat(weight) <= 0) {
      errors.weight = "Waga musi być większa od zera";
      isValid = false;
    } else if (selectedBatchData && parseFloat(weight) > selectedBatchData.availableWeight) {
      errors.weight = `Waga nie może przekraczać dostępnej (${selectedBatchData.availableWeight} kg)`;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Błąd",
        description: "Popraw błędy w formularzu",
        variant: "destructive"
      });
      return;
    }

    try {
      await assignFraction({
        batchId: parseInt(selectedBatch),
        fractionId: parseInt(selectedFraction),
        weight: parseFloat(weight)
      });

      // Reset formularza po udanym zapisie
      setSelectedBatch("");
      setSelectedFraction("");
      setWeight("");
      setFormErrors({ batch: "", fraction: "", weight: "" });
    } catch (error) {
      // Błędy są już obsługiwane w hooku useAssignFraction
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Przypisz frakcję do partii produkcyjnej</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <BatchSelect
            batches={batches}
            value={selectedBatch}
            onChange={setSelectedBatch}
            isLoading={batchesLoading}
            error={formErrors.batch || batchesError}
          />

          <FractionSelect
            fractions={fractions}
            value={selectedFraction}
            onChange={setSelectedFraction}
            isLoading={fractionsLoading}
            error={formErrors.fraction || fractionsError}
          />

          <WeightInput
            value={weight}
            onChange={setWeight}
            error={formErrors.weight}
            maxWeight={selectedBatchData?.availableWeight}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : "Nadaj frakcję"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
