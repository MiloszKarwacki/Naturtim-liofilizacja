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
import PermissionsDropdown, {
  Permission
} from "@/components/PermissionsDropdown";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";

// Widok strony wykorzystujący hook do pobierania użytkowników oraz nowe funkcjonalności
const Page = () => {
  // 1. Najpierw deklarujemy wszystkie hooki
  const { toast } = useToast();
  const { users, createUser, deleteUser, updateUser } = useUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // 2. Potem możemy zadeklarować nasze zmienne i funkcje
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
      toast({
        title: "✅ Sukces!",
        description: "Użytkownik usunięty pomyślnie!",
        className: "bg-green-500 text-white border-0"
      });
      setUserToDelete(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Błąd",
        description: "Nie udało się usunąć użytkownika"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Użytkownicy</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Dodaj użytkownika</Button>
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
          {nonAdminUsers.map((user: User) =>
            <TableRow key={user.id}>
              <TableCell>
                {user.login}
              </TableCell>
              <TableCell>
                {user.username}
              </TableCell>
              <TableCell>
                {user.userSurname}
              </TableCell>
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
          )}
        </TableBody>
      </Table>

      <AddEmployeeDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={async userData => {
          try {
            await createUser(userData);
            toast({
              title: "✅ Sukces!",
              description: "Użytkownik dodany pomyślnie!",
              className: "bg-green-500 text-white border-0"
            });
          } catch (error) {
            toast({
              variant: "destructive",
              title: "❌ Błąd",
              description: "Błąd podczas dodawania użytkownika"
            });
          }
        }}
        existingEmployees={users}
      />

      {userToEdit &&
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
              toast({
                title: "✅ Sukces!",
                description: "Dane użytkownika zaktualizowane!",
                className: "bg-green-500 text-white border-0"
              });
            } catch (error) {
              toast({
                variant: "destructive",
                title: "❌ Błąd",
                description: "Błąd podczas aktualizacji danych"
              });
            }
          }}
        />}

      {userToDelete && (
        <DeleteEmployeeDialog
          open={!!userToDelete}
          employeeName={`${userToDelete.username} ${userToDelete.userSurname}`}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default Page;
