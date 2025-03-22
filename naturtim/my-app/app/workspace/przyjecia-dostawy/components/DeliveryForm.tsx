import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormData, FormErrors, Product, Supplier, Recipient } from "../types/delivery";
import { DeliveryFormProps } from "../types/delivery";

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  formData,
  setFormData,
  products,
  suppliers,
  recipients,
  onSubmit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBatchNumber, setEditedBatchNumber] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    batchNumber: "",
    product: "",
    supplier: "",
    weight: "",
    boxCount: "",
  });

  // Walidacja numeru partii
  const validateBatchNumber = (batchNumber: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(batchNumber);
  };

  // Obsługa edycji numeru partii
  const handleBatchNumberEdit = () => {
    if (isEditing) {
      if (!validateBatchNumber(editedBatchNumber)) {
        setErrors({
          ...errors,
          batchNumber: "Niepoprawny format numeru partii. Wymagany format: XX/YY/ZZZZ"
        });
        return;
      }
      
      setFormData({...formData, batchNumber: editedBatchNumber});
      setErrors({...errors, batchNumber: ""});
      setIsEditing(false);
    } else {
      setEditedBatchNumber(formData.batchNumber);
      setIsEditing(true);
    }
  };

  // Walidacja formularza
  const validateForm = () => {
    const newErrors = {
      batchNumber: "",
      product: "",
      supplier: "",
      weight: "",
      boxCount: "",
    };
    
    // Sprawdzamy czy numer partii jest poprawny
    if (!formData.batchNumber) {
      newErrors.batchNumber = "Wymagane pole";
    } else if (!validateBatchNumber(formData.batchNumber)) {
      newErrors.batchNumber = "Niepoprawny format numeru partii. Wymagany format: XX/YY/ZZZZ";
    }
    
    // Walidacja wyboru produktu
    if (!formData.product) {
      newErrors.product = "Wybierz produkt";
    }
    
    // Walidacja wyboru dostawcy
    if (!formData.supplier) {
      newErrors.supplier = "Wybierz dostawcę";
    }
    
    // Walidacja wagi
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = "Waga musi być większa od zera";
    }
    
    // Walidacja ilości kartonów
    if (!formData.boxCount || formData.boxCount <= 0) {
      newErrors.boxCount = "Ilość kartonów musi być liczbą dodatnią";
    }
    
    setErrors(newErrors);
    
    // Sprawdzamy czy są błędy
    return !Object.values(newErrors).some(error => error);
  };

  // Obsługa submitu formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Przyjęcie dostawy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Numer partii */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Numer partii (format: XX/YY/ZZZZ)
              </label>
              <div className="flex gap-2">
                <Input
                  value={isEditing ? editedBatchNumber : formData.batchNumber}
                  onChange={(e) => setEditedBatchNumber(e.target.value)}
                  disabled={!isEditing}
                  placeholder="XX/YY/ZZZZ"
                  className={errors.batchNumber ? "border-red-500" : ""}
                />
                <Button type="button" variant="outline" onClick={handleBatchNumberEdit}>
                  {isEditing ? "Zapisz" : "Edytuj"}
                </Button>
              </div>
              {errors.batchNumber ? (
                <p className="text-sm text-red-500 mt-1">{errors.batchNumber}</p>
              ) : null}
              <p className="text-xs text-muted-foreground mt-1">
                XX - numer seryjny, YY - miesiąc, ZZZZ - rok
              </p>
            </div>
          </div>

          {/* Produkt */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Produkt
            </label>
            <Select 
              value={formData.product?.id?.toString() || ""}
              onValueChange={(value) => {
                const selectedId = parseInt(value);
                const selectedProduct = products.find(p => p.id === selectedId);
                setFormData({...formData, product: selectedProduct || null});
                setErrors({...errors, product: ""});  // Usuwamy błąd po wyborze
              }}
            >
              <SelectTrigger className={errors.product ? "border-red-500" : ""}>
                <SelectValue placeholder="Wybierz produkt" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={`product-${product.id}`} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product ? (
              <p className="text-sm text-red-500 mt-1">{errors.product}</p>
            ) : null}
          </div>

          {/* Dostawca i Odbiorca */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Dostawca
              </label>
              <Select 
                value={formData.supplier?.id?.toString() || ""}
                onValueChange={(value) => {
                  const supplierId = parseInt(value);
                  const supplier = suppliers.find(s => s.id === supplierId);
                  setFormData({...formData, supplier: supplier || null});
                }}
              >
                <SelectTrigger className={errors.supplier ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz dostawcę" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={`supplier-${supplier.id}`} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier ? (
                <p className="text-sm text-red-500 mt-1">{errors.supplier}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Odbiorca
              </label>
              <Select 
                value={formData.recipient?.id?.toString() || ""}
                onValueChange={(value) => {
                  const recipientId = parseInt(value);
                  const recipient = recipients.find(r => r.id === recipientId);
                  setFormData({...formData, recipient: recipient || null});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz odbiorcę" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map(recipient => (
                    <SelectItem key={`recipient-${recipient.id}`} value={recipient.id.toString()}>
                      {recipient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Waga i ilość kartonów */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Waga (kg)
              </label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                className={errors.weight ? "border-red-500" : ""}
              />
              {errors.weight ? (
                <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ilość kartonów
              </label>
              <Input
                type="number"
                value={formData.boxCount}
                onChange={(e) => setFormData({...formData, boxCount: Number(e.target.value)})}
                className={errors.boxCount ? "border-red-500" : ""}
              />
              {errors.boxCount ? (
                <p className="text-sm text-red-500 mt-1">{errors.boxCount}</p>
              ) : null}
            </div>
          </div>

          {/* Uwagi */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Uwagi (opcjonalnie)
            </label>
            <Textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full">
            Podsumuj
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 