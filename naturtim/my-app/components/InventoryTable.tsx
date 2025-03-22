"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, ArrowLeft } from "lucide-react";
import { SearchBar } from "./SearchBar";

// Definicja interfejsu dla frakcji, czyli BatchFraction
interface BatchFraction {
  fraction: {
    name: string;
  };
  polproduktWeight: number;
  gotowyProduktWeight: number;
  wasteWeight: number;
  qualityControlDate?: string;
}

// Rozszerzony interfejs dla partii (delivery) o frakcje
interface Delivery {
  id: number;
  batchNumber: string;
  batchFractions?: BatchFraction[]; // *** Nowość *** – możliwa lista frakcji dla partii
  createdAt: string;
  lastInventoryAt?: string;
  product: { name: string };
  // Inne właściwości, przykładowo: mroznia, polprodukt, gotowyProdukt, kartony, itp.
  [key: string]: any;
}

interface InventoryTableProps {
  title: string;
  headerBgColor?: string;
  fetchUrl: string;
  patchUrl: string;
  quantityKey: string; // np. "mroznia", "polprodukt", "gotowyProdukt"
  quantityColumnLabel: string;
  productNameColumnLabel?: string;
  updateDialogMessage: (delivery: Delivery) => string;
}

export function InventoryTable({
  title,
  headerBgColor = "bg-white",
  fetchUrl,
  patchUrl,
  quantityKey,
  quantityColumnLabel,
  updateDialogMessage,
  productNameColumnLabel = "Nazwa produktu"
}: InventoryTableProps) {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [newQuantity, setNewQuantity] = useState<number>(0);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error("Błąd przy pobieraniu danych");
      }
      const data = await res.json();
      setDeliveries(data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  useEffect(
    () => {
      fetchDeliveries();
    },
    [fetchUrl]
  );

  const handleOpenDialog = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setNewQuantity(delivery[quantityKey] as number);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDelivery(null);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedDelivery) return;
    try {
      const res = await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryId: selectedDelivery.id,
          newQuantity: newQuantity,
          quantityKey: quantityKey
        })
      });
      if (!res.ok) {
        throw new Error("Błąd przy aktualizacji inwentaryzacji");
      }
      await fetchDeliveries();
      handleCloseDialog();
    } catch (error) {
      console.error("Błąd aktualizacji inwentaryzacji:", error);
    }
  };

  const filteredDeliveries = deliveries.filter(
    delivery =>
      delivery.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funkcja pomocnicza, która wybiera właściwą wartość frakcji
  // dla magazynu określonego przez quantityKey
  const getFractionQuantity = (
    batchFraction: BatchFraction,
    quantityKeyParam: string
  ) => {
    switch (quantityKeyParam) {
      case "polprodukt":
        return batchFraction.polproduktWeight;
      case "gotowyProdukt":
      case "finalny":
        return batchFraction.gotowyProduktWeight;
      case "mroznia":
        // Dla mroźni nie ma osobnej wagi frakcji w naszym schemacie,
        // więc wyświetlamy polproduktWeight jako przykład
        return batchFraction.polproduktWeight;
      default:
        return null;
    }
  };

  // Funkcja renderująca numer partii wraz z listą frakcji (jeśli są)
  const renderBatchWithFraction = (delivery: Delivery) => {
    return (
      <div>
        <div className="font-medium">
          {delivery.batchNumber}
        </div>
        {delivery.batchFractions &&
          delivery.batchFractions.length > 0 &&
          <div className="flex flex-wrap gap-2 mt-2">
            {delivery.batchFractions.map((bf, index) => {
              const qty = getFractionQuantity(bf, quantityKey);
              return (
                <div
                  key={index}
                  className="inline-block mr-2 px-2 py-1 bg-gray-100 rounded text-xs"
                >
                  {bf.fraction.name}:{" "}
                  {qty !== null && qty > 0 ? `${qty} kg` : "- kg"}
                </div>
              );
            })}
          </div>}
      </div>
    );
  };

  return (
    <div className="p-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Powrót
      </Button>

      <Card className={`mb-6 ${headerBgColor}`}>
        <CardHeader>
          <CardTitle className="text-2xl">
            {title}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <SearchBar
            placeholder="Szukaj produktu lub numeru partii..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numer partii</TableHead>
                <TableHead>
                  {productNameColumnLabel}
                </TableHead>
                <TableHead className="text-right">
                  {quantityColumnLabel}
                </TableHead>
                <TableHead className="text-right">
                  Ostatnia inwentaryzacja
                </TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map(delivery =>
                <TableRow key={delivery.id}>
                  <TableCell>
                    {renderBatchWithFraction(delivery)}
                  </TableCell>
                  <TableCell>
                    {delivery.product.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {delivery[quantityKey]} kg
                  </TableCell>
                  <TableCell className="text-right">
                    {delivery.lastInventoryAt
                      ? new Date(delivery.lastInventoryAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(delivery)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aktualizacja inwentaryzacji</DialogTitle>
            <DialogDescription>
              {selectedDelivery && updateDialogMessage(selectedDelivery)}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              type="number"
              value={newQuantity}
              onChange={e => setNewQuantity(Number(e.target.value))}
              placeholder="Ilość (kg)"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Anuluj
            </Button>
            <Button onClick={handleConfirmUpdate}>Zatwierdź</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
