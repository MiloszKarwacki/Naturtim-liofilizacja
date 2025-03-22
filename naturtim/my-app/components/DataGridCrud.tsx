"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrashIcon, PlusIcon, SearchIcon, AlertCircle } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export interface DataGridCrudProps {
  title: string;
  fetchUrl: string;
  createUrl: string;
  deleteUrl: string;
  displayField: string;
  displayColumnHeader: string;
  addDialogLabel: string;
  addButtonText: string;
  showIdColumn?: boolean;
  transformFetchedItem?: (item: any) => { id: number; [key: string]: any };
  addSuccessMessage?: string;
  deleteSuccessMessage?: string;
}

export function DataGridCrud({
  title,
  fetchUrl,
  createUrl,
  deleteUrl,
  displayField,
  displayColumnHeader,
  addDialogLabel,
  addButtonText,
  showIdColumn = false,
  transformFetchedItem,
  addSuccessMessage,
  deleteSuccessMessage
}: DataGridCrudProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [itemToDeleteName, setItemToDeleteName] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Pobieramy dane z API
  useEffect(
    () => {
      fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
          const rowsData = data.map((item: any) => {
            if (transformFetchedItem) {
              return transformFetchedItem(item);
            }
            // Domyślna transformacja – zakładamy, że API zwraca { id, name }
            return { id: item.id, [displayField]: item.name };
          });
          setRows(rowsData);
        })
        .catch(err => console.error("Błąd pobierania danych:", err));
    },
    [fetchUrl, displayField, transformFetchedItem]
  );

  const filteredRows = rows.filter(row => {
    const value = row[displayField] || "";
    return value.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Paginacja
  const paginatedRows = filteredRows.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  const handleDeleteItem = (id: number) => {
    const itemToDelete = rows.find(row => row.id === id);
    setPendingDeleteId(id);
    setItemToDeleteName(itemToDelete?.[displayField] || "");
    setShowPasswordDialog(true);
  };

  const handlePasswordConfirm = async () => {
    if (passwordInput !== "admin123") {
      setPasswordError("Niepoprawne hasło! Spróbuj ponownie.");
      return;
    }

    if (pendingDeleteId === null) {
      setShowPasswordDialog(false);
      setPasswordInput("");
      setPasswordError("");
      return;
    }

    try {
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDeleteId })
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Błąd usuwania!");
        setShowPasswordDialog(false);
        setPasswordInput("");
        setPasswordError("");
        setPendingDeleteId(null);
        return;
      }

      setRows(prev => prev.filter(row => row.id !== pendingDeleteId));
      toast.success(deleteSuccessMessage || "Element został poprawnie usunięty! 🎉");
    } catch (error) {
      console.error(error);
      toast.error("Wystąpił błąd przy usuwaniu");
    }

    setShowPasswordDialog(false);
    setPasswordInput("");
    setPasswordError("");
    setPendingDeleteId(null);
  };

  const handleSaveNewItem = async () => {
    if (newItemName.trim() === "") {
      toast.error("Podaj nazwę!");
      return;
    }

    try {
      const res = await fetch(createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Błąd dodawania elementu");
      }

      const newItem = await res.json();
      const newRow = { id: newItem.id, [displayField]: newItem.name };
      setRows(prev => [...prev, newRow]);

      toast.success(addSuccessMessage || "Element został dodany! 🎉");

      setNewItemName("");
      setShowAddDialog(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Wystąpił błąd przy dodawaniu elementu"
      );
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full p-4">
      <h1 className="text-4xl mb-4 border-b-2 border-gray-300 pb-2 w-1/2 text-center font-bold">
        {title}
      </h1>

      <div className="mb-4">
        <Button
          onClick={() => setShowAddDialog(true)}
          size="lg"
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          {addButtonText}
        </Button>
      </div>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>
            {title}
          </CardTitle>
          <div className="relative">
            <SearchIcon className="absolute inset-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Szukaj ${displayColumnHeader.toLowerCase()}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {showIdColumn
                  ? <TableHead className="w-[80px]">ID</TableHead>
                  : null}
                <TableHead>
                  {displayColumnHeader}
                </TableHead>
                <TableHead className="w-[100px] text-right">Akcja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="min-h-[250px]">
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showIdColumn ? 3 : 2}
                    className="text-center h-[50px]"
                  >
                    Brak danych
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {paginatedRows.map(row => (
                    <TableRow key={row.id} className="h-[50px]">
                      {showIdColumn ? <TableCell>{row.id}</TableCell> : null}
                      <TableCell>{row[displayField]}</TableCell>
                      <TableCell className="text-right">
                        {row[displayField].toLowerCase() !== "brak" ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(row.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                  {Array.from({ length: Math.max(0, 5 - paginatedRows.length) }).map((_, index) => (
                    <TableRow key={`empty-${index}`} className="h-[50px]">
                      {showIdColumn ? <TableCell>&nbsp;</TableCell> : null}
                      <TableCell>&nbsp;</TableCell>
                      <TableCell>&nbsp;</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  className={
                    currentPage === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.max(1, totalPages) }).map((_, index) =>
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={currentPage === index}
                    onClick={() => setCurrentPage(index)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(p => Math.min(Math.max(totalPages - 1, 0), p + 1))}
                  className={
                    currentPage === Math.max(totalPages - 1, 0)
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={showPasswordDialog ? undefined : () => {
        setShowPasswordDialog(false);
        setPasswordInput("");
        setPasswordError("");
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 gap-2">
              <AlertCircle className="h-5 w-5" />
              Potwierdź usunięcie
            </DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć element <strong>{itemToDeleteName}</strong>? Ta operacja jest nieodwracalna.
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
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className={passwordError ? "border-red-600" : ""}
                placeholder="Wpisz hasło..."
              />
              {passwordError ? (
                <p className="text-sm text-red-600">{passwordError}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordInput("");
                setPasswordError("");
              }}
            >
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handlePasswordConfirm}>
              Usuń element
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {addButtonText}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={addDialogLabel}
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewItemName("");
              }}
            >
              Anuluj
            </Button>
            <Button onClick={handleSaveNewItem}>Dodaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
