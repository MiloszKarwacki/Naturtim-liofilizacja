import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FormData, Product, Supplier, Recipient } from '../types/delivery';
import { useDelivery } from './useDelivery';
import { useGenerateBatchNumber } from './useGenerateBatchNumber';

export function useDeliveryForm() {
  // Pobieramy numer partii używając dedykowanego hooka
  const { batchNumber, loading: loadingBatchNumber, refetch: refetchBatchNumber } = useGenerateBatchNumber();
  
  // Hook do interakcji z API dostaw
  const { createDelivery, loading: submitting } = useDelivery();
  
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
  
  // Pobieranie danych
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Pobieranie wszystkich potrzebnych danych równolegle
        const [productsRes, suppliersRes, recipientsRes] = await Promise.all([
          fetch("/workspace/przyjecia-dostawy/api/products"),
          fetch("/workspace/przyjecia-dostawy/api/suppliers"),
          fetch("/workspace/przyjecia-dostawy/api/recipients"),
        ]);
        
        if (!productsRes.ok) throw new Error('Problem z pobraniem produktów');
        if (!suppliersRes.ok) throw new Error('Problem z pobraniem dostawców');
        if (!recipientsRes.ok) throw new Error('Problem z pobraniem odbiorców');
        
        const productsData = await productsRes.json();
        const suppliersData = await suppliersRes.json();
        const recipientsData = await recipientsRes.json();
        
        setProducts(productsData);
        setSuppliers(suppliersData);
        setRecipients(recipientsData);
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        toast.error('Nie udało się załadować potrzebnych danych');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Ustawiamy numer partii, gdy zostanie pobrany
  useEffect(() => {
    if (batchNumber) {
      setFormData(prev => ({ ...prev, batchNumber }));
    }
  }, [batchNumber]);
  
  // Walidacja numeru partii
  const validateBatchNumber = (batchNumber: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(batchNumber);
  };
  
  // Obsługa potwierdzenia w podsumowaniu
  const handleConfirm = async () => {
    try {
      // Sprawdź poprawność numeru partii przed wysłaniem
      if (!validateBatchNumber(formData.batchNumber)) {
        toast.error("Niepoprawny format numeru partii. Wymagany format: XX/YY/ZZZZ");
        setShowSummary(false);
        return;
      }
      
      // Sprawdź czy wszystkie wymagane pola są wypełnione
      if (!formData.product || !formData.supplier || formData.weight <= 0 || formData.boxCount <= 0) {
        toast.error("Wypełnij wszystkie wymagane pola formularza");
        setShowSummary(false);
        return;
      }
      
      // Wywołujemy hook do tworzenia dostawy
      const result = await createDelivery(formData);
      
      setShowSummary(false);
      toast.success(`Dostawa o numerze ${result.batchNumber} została pomyślnie przyjęta!`);
      
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
      
      // Pobieramy nowy numer partii
      refetchBatchNumber();
    } catch (error: any) {
      toast.error(error?.message || "Wystąpił błąd podczas tworzenia dostawy");
      setShowSummary(false);
    }
  };
  
  return {
    products,
    suppliers,
    recipients,
    loading: loading || loadingBatchNumber,
    submitting,
    formData,
    setFormData,
    showSummary,
    setShowSummary,
    handleConfirm,
    validateBatchNumber
  };
} 