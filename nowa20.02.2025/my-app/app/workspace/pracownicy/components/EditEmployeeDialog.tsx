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
import {
  APP_PERMISSIONS,
  getManagementPermissions,
  getMainPermissions
} from "@/config/permissions";

interface EditEmployeeDialogProps {
  open: boolean;
  employee: any; // W praktyce zastąp "any" odpowiednim typem pracownika
  onClose: () => void;
  onSubmit: (updatedEmployee: any) => void;
}

interface Permission {
  name: string;
  href: string;
}

export default function EditEmployeeDialog({
  open,
  employee,
  onClose,
  onSubmit
}: EditEmployeeDialogProps) {
  const { permissions } = usePermissions();
  const [formData, setFormData] = useState({
    password: "",
    username: employee.username,
    userSurname: employee.userSurname,
    permissions: employee.permissions.map((p: Permission) => p.name)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Załaduj uprawnienia pracownika przy każdorazowym otwarciu dialogu lub zmianie pracownika
  useEffect(
    () => {
      if (employee && open) {
        console.log(
          "Otwieram EditEmployeeDialog. Uprawnienia pracownika:",
          employee.permissions
        );
        setSelectedPermissions(
          employee.permissions.map((p: Permission) => p.name)
        );
      }
    },
    [employee, open]
  );

  useEffect(
    () => {
      setFormData({
        password: "",
        username: employee.username,
        userSurname: employee.userSurname,
        permissions: employee.permissions.map((p: Permission) => p.name)
      });
    },
    [employee]
  );

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    console.log("Zmieniam uprawnienie:", permissionName, "checked:", checked);
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
    if (selectedPermissions.length === 0) {
      newErrors.permissions = "Wybierz przynajmniej jedno uprawnienie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Po prostu przekazujemy dane do onSubmit
      onSubmit({
        ...employee,
        username: formData.username,
        userSurname: formData.userSurname,
        permissions: selectedPermissions.map(name => ({ name }))
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edycja uprawnień</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Pola formularza */}
          <div className="flex flex-col space-y-2">
            <div className="text-lg font-semibold text-center text-green-600">
              {formData.username} {formData.userSurname}
            </div>
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
                    id={`edit-${permission.name}`}
                    checked={selectedPermissions.includes(permission.name)}
                    onChange={e =>
                      handlePermissionChange(permission.name, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`edit-${permission.name}`}>
                    {permission.name}
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Uprawnienia zarządzania */}
          {managementPermissions.length > 0 &&
            <div>
              <strong>Zarządzanie</strong>
              <div className="grid grid-cols-2 gap-2 mt-2 ml-6">
                {managementPermissions.map(permission =>
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`edit-${permission.name}`}
                      checked={selectedPermissions.includes(permission.name)}
                      onChange={e =>
                        handlePermissionChange(
                          permission.name,
                          e.target.checked
                        )}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`edit-${permission.name}`}>
                      {permission.name}
                    </label>
                  </div>
                )}
              </div>
            </div>}

          {errors.permissions &&
            <p className="text-red-500 text-sm">
              {errors.permissions}
            </p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
