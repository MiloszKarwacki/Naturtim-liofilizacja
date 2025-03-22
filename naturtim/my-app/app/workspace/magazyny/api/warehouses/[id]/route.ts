import { NextResponse } from 'next/server';
import { getWarehouseDetails, updateWarehouseFraction } from '../../../services/warehouseService';

// Pobieranie konkretnego magazynu wraz z frakcjami
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const warehouseId = parseInt(params.id);
    
    if (isNaN(warehouseId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID magazynu" },
        { status: 400 }
      );
    }
    
    const warehouse = await getWarehouseDetails(warehouseId);
    
    if (!warehouse) {
      return NextResponse.json(
        { error: "Magazyn nie został znaleziony" },
        { status: 404 }
      );
    }
    
    // Formatujemy dane do formatu zgodnego z InventoryTable
    const formattedData = warehouse.fractions.map(fraction => {
      // Określamy klucz na podstawie ID magazynu
      let quantityKey = '';
      switch(warehouseId) {
        case 1: quantityKey = 'mroznia'; break;
        case 2: quantityKey = 'polfabrykat'; break; // Zauważ zmianę z polfabrykat na polprodukt!
        case 3: quantityKey = 'gotowyProdukt'; break; // Zauważ wielkość liter!
        case 4: quantityKey = 'kartony'; break;
        default: quantityKey = warehouse.name.toLowerCase().replace(/ /g, '');
      }
      
      return {
        id: fraction.id,
        batchNumber: fraction.batchNumber || '-',
        createdAt: warehouse.lastInventoryDate,
        lastInventoryAt: warehouse.lastInventoryDate,
        product: {
          name: fraction.productName || fraction.fractionName
        },
        // Używamy właściwego klucza dla magazynu
        [quantityKey]: fraction.weight,
        fractionId: fraction.fractionId,
        fractionName: fraction.fractionName,
        productionBatchId: fraction.productionBatchId
      };
    });
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Błąd podczas pobierania magazynu:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać magazynu" },
      { status: 500 }
    );
  }
}

// Aktualizacja wagi frakcji w magazynie
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const warehouseId = parseInt(params.id);
    
    if (isNaN(warehouseId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID magazynu" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { fractionId, newQuantity, productionBatchId } = body;
    
    if (!fractionId) {
      return NextResponse.json(
        { error: "Brak wymaganych danych (fractionId)" },
        { status: 400 }
      );
    }
    
    const updatedWarehouse = await updateWarehouseFraction(
      warehouseId,
      fractionId,
      newQuantity,
      productionBatchId
    );
    
    if (!updatedWarehouse) {
      return NextResponse.json(
        { error: "Magazyn nie został znaleziony" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedWarehouse });
  } catch (error) {
    console.error("Błąd podczas aktualizacji frakcji w magazynie:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować frakcji w magazynie" },
      { status: 500 }
    );
  }
} 