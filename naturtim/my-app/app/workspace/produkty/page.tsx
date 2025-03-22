"use client";
import React from "react";
import { DataGridCrud } from "@/components/DataGridCrud";
import { product } from "@/app/workspace/produkty/types/product";

export default function ProduktyPage() {
  const transformProductItem = (item: product) => {
    return {
      id: item.id,
      productName: item.name
    };
  };

  return (
    <DataGridCrud
      title="Produkty"
      fetchUrl="/workspace/produkty/api"
      createUrl="/workspace/produkty/api"
      deleteUrl="/workspace/produkty/api"
      displayField="productName"
      displayColumnHeader="Nazwa produktu"
      addDialogLabel="Nazwa produktu"
      addButtonText="Dodaj produkt"
      showIdColumn={true}
      transformFetchedItem={transformProductItem}
      addSuccessMessage="Produkt został dodany! 🎉"
      deleteSuccessMessage="Produkt został poprawnie usunięty! 🎉"
    />
  );
}
