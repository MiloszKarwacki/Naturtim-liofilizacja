"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGeneratedLogin } from "@/hooks/useGeneratedLogin";
import {
  APP_PERMISSIONS,
  getManagementPermissions,
  getMainPermissions
} from "@/config/permissions";

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (employee: any) => Promise<void>;
  existingEmployees: any[];
}

export default function AddEmployeeDialog({
  open,
  onClose,
  onSubmit,
  existingEmployees
}: AddEmployeeDialogProps) {
  const { permissions } = usePermissions();
  const [formData, setFormData] = useState({
    username: "",
    userSurname: "",
    password: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Automatycznie generowany login na podstawie imienia i nazwiska
  const generatedLogin = useGeneratedLogin(
    formData.username,
    formData.userSurname,
    existingEmployees
  );

  // Local state dla wybranych uprawnień
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Grupujemy uprawnienia z centralnej konfiguracji
  const mainPermissions = permissions.filter(p => {
    const config = APP_PERMISSIONS.find(cfg => cfg.name === p.name);
    return config && !config.isManagement;
  });

  const managementPermissions = permissions.filter(p => {
    const config = APP_PERMISSIONS.find(cfg => cfg.name === p.name);
    return config && config.isManagement;
  });

  // Reset formularza przy otwarciu
  useEffect(
    () => {
      if (open) {
        setFormData({
          username: "",
          userSurname: "",
          password: ""
        });
        setSelectedPermissions([]);
        setErrors({});
      }
    },
    [open]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionName]);
    } else {
      setSelectedPermissions(prev =>
        prev.filter(permission => permission !== permissionName)
      );
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.username.length < 2) {
      newErrors.username = "Imię musi mieć minimum 2 znaki";
    }
    if (formData.userSurname.length < 2) {
      newErrors.userSurname = "Nazwisko musi mieć minimum 2 znaki";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Hasło musi mieć minimum 6 znaków";
    }
    if (selectedPermissions.length === 0) {
      newErrors.permissions = "Wybierz przynajmniej jedno uprawnienie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit({
          login: generatedLogin,
          username: formData.username,
          userSurname: formData.userSurname,
          password: formData.password,
          permissions: selectedPermissions
        });
        onClose();
      } catch (error) {
        console.error("Błąd podczas dodawania pracownika:", error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowego pracownika</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Imię */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="username">Imię</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
              {errors.username &&
                <p className="text-red-500 text-sm">
                  {errors.username}
                </p>}
            </div>

            {/* Nazwisko */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="userSurname">Nazwisko</Label>
              <Input
                id="userSurname"
                name="userSurname"
                value={formData.userSurname}
                onChange={handleInputChange}
              />
              {errors.userSurname &&
                <p className="text-red-500 text-sm">
                  {errors.userSurname}
                </p>}
            </div>

            {/* Login */}
            <div className="flex flex-col space-y-2">
              <Label>Login</Label>
              <Input value={generatedLogin} disabled />
              <p className="text-sm text-gray-500">
                Login jest generowany automatycznie
              </p>
            </div>

            {/* Hasło */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password &&
                <p className="text-red-500 text-sm">
                  {errors.password}
                </p>}
            </div>

            {/* Główne uprawnienia */}
            <div>
              <strong>Główne uprawnienia</strong>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {mainPermissions.map(permission =>
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`${permission.name}`}
                      checked={selectedPermissions.includes(permission.name)}
                      onChange={e =>
                        handlePermissionChange(
                          permission.name,
                          e.target.checked
                        )}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`${permission.name}`}>
                      {permission.name}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Uprawnienia zarządzania */}
            {managementPermissions.length > 0
              ? <div>
                  <strong>Zarządzanie</strong>
                  <div className="grid grid-cols-2 gap-2 mt-2 ml-6">
                    {managementPermissions.map(permission =>
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`${permission.name}`}
                          checked={selectedPermissions.includes(
                            permission.name
                          )}
                          onChange={e =>
                            handlePermissionChange(
                              permission.name,
                              e.target.checked
                            )}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`${permission.name}`}>
                          {permission.name}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              : null}

            {errors.permissions &&
              <p className="text-red-500 text-sm">
                {errors.permissions}
              </p>}
          </div>
          <DialogFooter>
            <Button type="submit">Dodaj pracownika</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
