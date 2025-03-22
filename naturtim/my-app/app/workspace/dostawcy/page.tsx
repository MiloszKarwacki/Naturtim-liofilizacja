"use client";
import React from "react";
import { DataGridCrud } from "@/components/DataGridCrud";
import { supplier } from "@/app/workspace/dostawcy/types/supplier";

export default function DostawcyPage() {
  const transformSupplierItem = (item: supplier) => {
    return {
      id: item.id,
      supplierName: item.name
    };
  };

  return (
    <DataGridCrud
      title="Dostawcy"
      fetchUrl="/workspace/dostawcy/api"
      createUrl="/workspace/dostawcy/api"
      deleteUrl="/workspace/dostawcy/api"
      displayField="supplierName"
      displayColumnHeader="Nazwa dostawcy"
      addDialogLabel="Nazwa dostawcy"
      addButtonText="Dodaj dostawcę"
      showIdColumn={true}
      transformFetchedItem={transformSupplierItem}
      addSuccessMessage="Dostawca został dodany! 🎉"
      deleteSuccessMessage="Dostawca został poprawnie usunięty! 🎉"
    />
  );
}
