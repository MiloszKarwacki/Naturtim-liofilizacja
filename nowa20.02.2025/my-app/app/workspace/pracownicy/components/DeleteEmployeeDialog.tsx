"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react"; // Dodaj ikonkę ostrzeżenia

interface DeleteEmployeeDialogProps {
  open: boolean;
  employeeName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteEmployeeDialog({
  open,
  employeeName,
  onClose,
  onConfirm
}: DeleteEmployeeDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (password !== "admin123") {
      setError("Niepoprawne hasło! Spróbuj ponownie.");
      return;
    }

    onConfirm();
    setPassword("");
    setError("");
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600 gap-2">
            <AlertCircle className="h-5 w-5" />
            Potwierdź usunięcie użytkownika
          </DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć użytkownika{" "}
            <strong>{employeeName}</strong>? Ta operacja jest nieodwracalna.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Potwierdź usunięcie wpisując hasło{" "}
              <span className="font-mono font-bold">admin123</span>:
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={error ? "border-red-600" : ""}
              placeholder="Wpisz hasło..."
            />
            {error &&
              <p className="text-sm text-red-600">
                {error}
              </p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Usuń użytkownika
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
