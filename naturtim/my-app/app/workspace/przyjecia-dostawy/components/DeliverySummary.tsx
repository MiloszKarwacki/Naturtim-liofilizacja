import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormData } from "../types/delivery";

interface DeliverySummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  onConfirm: () => void;
}

export const DeliverySummary: React.FC<DeliverySummaryProps> = ({
  open,
  onOpenChange,
  formData,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Podsumowanie przyjęcia dostawy</DialogTitle>
          <DialogDescription>
            Sprawdź poprawność danych przed potwierdzeniem
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="border-b pb-3">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 w-32">Numer partii:</span>
              <span className="text-lg font-medium">{formData.batchNumber}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <span className="block font-semibold text-gray-700 mb-1">Produkt:</span>
              <span>{formData.product?.name}</span>
            </div>
            
            <div>
              <span className="block font-semibold text-gray-700 mb-1">Dostawca:</span>
              <span>{formData.supplier?.name}</span>
            </div>
            
            <div>
              <span className="block font-semibold text-gray-700 mb-1">Odbiorca:</span>
              <span>{formData.recipient?.name || "-"}</span>
            </div>
            
            <div>
              <span className="block font-semibold text-gray-700 mb-1">Waga:</span>
              <span>{formData.weight} kg</span>
            </div>
            
            <div>
              <span className="block font-semibold text-gray-700 mb-1">Ilość kartonów:</span>
              <span>{formData.boxCount}</span>
            </div>
          </div>
          
          {formData.notes ? (
            <div className="border-t pt-3">
              <span className="block font-semibold text-gray-700 mb-1">Uwagi:</span>
              <span className="whitespace-pre-wrap">{formData.notes || "brak"}</span>
            </div>
          ) : null}
        </div>
        
        <DialogFooter className="pt-2 space-x-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm} 
            className="px-6"
            disabled={!formData.product || !formData.supplier || formData.weight <= 0 || formData.boxCount <= 0}
          >
            Potwierdź
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 