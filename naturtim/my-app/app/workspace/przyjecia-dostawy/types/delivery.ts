// Typy
export type Product = { id: number; name: string };
export type Supplier = { id: number; name: string };
export type Recipient = { id: number; name: string };

export interface FormData {
  batchNumber: string;
  product: Product | null;
  supplier: Supplier | null;
  recipient: Recipient | null;
  weight: number;
  boxCount: number;
  notes: string;
}

export interface FormErrors {
  batchNumber: string;
  product: string;
  supplier: string;
  weight: string;
  boxCount: string;
} 

export interface DeliveryFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  products: Product[];
  suppliers: Supplier[];
  recipients: Recipient[];
  onSubmit: () => void;
}

export interface DeliveryInput {
  batchNumber: string;
  productId: number;
  supplierId: number;
  recipientId?: number | null;
  weight: number;
  boxCount: number;
  notes?: string;
}