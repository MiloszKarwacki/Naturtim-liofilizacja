"use client";
import React, { useState } from "react";
import AddEmployeeDialog from "@/app/workspace/pracownicy/components/AddEmployeeDialog";
import EditEmployeeDialog from "@/app/workspace/pracownicy/components/EditEmployeeDialog";
import DeleteEmployeeDialog from "@/app/workspace/pracownicy/components/DeleteEmployeeDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import PermissionsDropdown from "@/components/PermissionsDropdown";
import { useUsers } from "@/app/workspace/pracownicy/hooks/useUsers";
import { toast } from "sonner";
import { User } from "@/types/user";

// Widok strony do zarządzania pracownikami
const Page = () => {
  const { users, createUser, deleteUser, updateUser } = useUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Filtrujemy użytkowników poza kontem admina
  const nonAdminUsers = users.filter(user => user.login !== "admin");

  const handleEdit = (user: User) => {
    setUserToEdit(user);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(Number(userToDelete?.id));
      toast.success("Użytkownik usunięty pomyślnie! 🎉");
      setUserToDelete(null);
    } catch (error) {
      toast.error("Nie udało się usunąć użytkownika");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Użytkownicy</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Dodaj użytkownika
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Login</TableHead>
            <TableHead>Imię</TableHead>
            <TableHead>Nazwisko</TableHead>
            <TableHead>Uprawnienia</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nonAdminUsers.map((user: User) => (
            <TableRow key={user.id}>
              <TableCell>{user.login}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.userSurname}</TableCell>
              <TableCell>
                <PermissionsDropdown permissions={user.permissions} />
              </TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" onClick={() => handleEdit(user)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteClick(user)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddEmployeeDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={async userData => {
          try {
            await createUser(userData);
            toast.success("Użytkownik dodany pomyślnie! 🎉");
          } catch (error) {
            toast.error("Błąd podczas dodawania użytkownika");
          }
        }}
        existingEmployees={users}
      />

      {userToEdit ? (
        <EditEmployeeDialog
          open={!!userToEdit}
          employee={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSubmit={async (updatedUser: User) => {
            try {
              await updateUser(userToEdit.id, {
                username: updatedUser.username,
                userSurname: updatedUser.userSurname,
                permissions: updatedUser.permissions.map(p => p.name)
              });
              setUserToEdit(null);
              toast.success("Dane użytkownika zaktualizowane! 🎉");
            } catch (error) {
              toast.error("Błąd podczas aktualizacji danych");
            }
          }}
        />
      ) : null}

      {userToDelete ? (
        <DeleteEmployeeDialog
          open={true}
          employeeName={`${userToDelete.username} ${userToDelete.userSurname}`}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </div>
  );
};

export default Page;
