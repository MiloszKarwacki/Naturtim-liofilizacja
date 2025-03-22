export interface WarehouseInfo {
    id: number;
    name: string;
    description?: string;
    totalWeight: number;
    lastInventoryDate: string;
    fractionCount: number;
  }
  
  export interface WarehouseFractionInfo {
    id: number;
    fractionId: number;
    fractionName: string;
    weight: number;
    batchNumber?: string;
    productName?: string;
    productionBatchId?: number;
  }
  
  export interface WarehouseDetails {
    id: number;
    name: string;
    description?: string;
    totalWeight: number;
    lastInventoryDate: string;
    fractions: WarehouseFractionInfo[];
  }