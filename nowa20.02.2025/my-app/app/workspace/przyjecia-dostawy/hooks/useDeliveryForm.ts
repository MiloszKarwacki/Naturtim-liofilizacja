import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FormData, Product, Supplier, Recipient } from '../types';

export function useDeliveryForm() {
  // Stany dla danych
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stan formularza
  const [formData, setFormData] = useState<FormData>({
    batchNumber: "",
    product: null,
    supplier: null,
    recipient: null,
    weight: 0,
    boxCount: 0,
    notes: "",
  });
  
  // Stan podsumowania
  const [showSummary, setShowSummary] = useState(false);
  
  // Pobieranie numeru partii
  const fetchBatchNumber = async () => {
    try {
      const response = await fetch('/api/przyjecie-dostawy/generate-batch-number');
      if (!response.ok) {
        throw new Error('Problem z pobraniem numeru partii');
      }
      const data = await response.json();
      setFormData(prev => ({ ...prev, batchNumber: data.batchNumber }));
    } catch (error) {
      console.error('Błąd podczas pobierania numeru partii:', error);
      toast.error('Nie udało się wygenerować numeru partii');
    }
  };
  
  // Pobieranie danych
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Pobieranie wszystkich potrzebnych danych równolegle
        const [productsRes, suppliersRes, recipientsRes, batchNumberRes] = await Promise.all([
          fetch('/api/przyjecie-dostawy/products'),
          fetch('/api/przyjecie-dostawy/suppliers'),
          fetch('/api/przyjecie-dostawy/recipients'),
          fetch('/api/przyjecie-dostawy/generate-batch-number')
        ]);
        
        if (!productsRes.ok || !suppliersRes.ok || !recipientsRes.ok || !batchNumberRes.ok) {
          throw new Error('Problem z pobraniem danych');
        }
        
        const productsData = await productsRes.json();
        const suppliersData = await suppliersRes.json();
        const recipientsData = await recipientsRes.json();
        const batchNumberData = await batchNumberRes.json();
        
        setProducts(productsData);
        setSuppliers(suppliersData);
        setRecipients(recipientsData);
        setFormData(prev => ({ ...prev, batchNumber: batchNumberData.batchNumber }));
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        toast.error('Nie udało się załadować potrzebnych danych');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Walidacja numeru partii
  const validateBatchNumber = (batchNumber: string): boolean => {
    // Sprawdzenie poprawności formatu XX/YY/ZZZZ
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(batchNumber);
  };
  
  // Obsługa potwierdzenia w podsumowaniu
  const handleConfirm = async () => {
    try {
      // Sprawdź poprawność numeru partii przed wysłaniem
      if (!validateBatchNumber(formData.batchNumber)) {
        toast.error("Niepoprawny format numeru partii. Wymagany format: XX/YY/ZZZZ");
        return;
      }
      
      const response = await fetch('/api/przyjecie-dostawy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: formData.product?.id,
          supplierId: formData.supplier?.id,
          recipientId: formData.recipient?.id,
          weight: formData.weight,
          boxCount: formData.boxCount,
          notes: formData.notes,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Wystąpił błąd podczas zapisywania dostawy');
      }
      
      const result = await response.json();
      setShowSummary(false);
      toast.success(`Dostawa ${result.batchNumber} została pomyślnie przyjęta! 🎉`);
      
      // Resetujemy formularz i pobieramy nowy numer partii
      setFormData({
        batchNumber: "",
        product: null,
        supplier: null,
        recipient: null,
        weight: 0,
        boxCount: 0,
        notes: "",
      });
      
      fetchBatchNumber();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd");
    }
  };
  
  return {
    products,
    suppliers,
    recipients,
    loading,
    formData,
    setFormData,
    showSummary,
    setShowSummary,
    handleConfirm,
    validateBatchNumber,
    fetchBatchNumber
  };
} 