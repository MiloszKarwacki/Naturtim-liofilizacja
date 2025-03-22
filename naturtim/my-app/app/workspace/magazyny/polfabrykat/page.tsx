"use client";
import { InventoryTable } from "@/components/InventoryTable";
import React from "react";

const PolfabrykatPage = () => {
  // ID magazynu "Półfabrykat" z tabeli Warehouse
  const POLFABRYKAT_ID = 2;

  return (
    <div>
      <InventoryTable
        title="Magazyn Półfabrykatu"
        headerBgColor="bg-green-100"
        fetchUrl={`/workspace/magazyny/api/warehouses/${POLFABRYKAT_ID}`}
        patchUrl={`/workspace/magazyny/api/warehouses/${POLFABRYKAT_ID}`}
        quantityKey="polfabrykat"
        quantityColumnLabel="Ilość (kg)"
        updateDialogMessage={delivery =>
          `Zmiana ilości półfabrykatu ${delivery.batchNumber}`}
      />
    </div>
  );
};

export default PolfabrykatPage;
