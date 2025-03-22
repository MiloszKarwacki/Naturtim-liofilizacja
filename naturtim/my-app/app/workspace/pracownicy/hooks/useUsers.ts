import { useState, useEffect } from "react";
import { useToast } from "../../../../hooks/use-toast";
import { User, CreateUserDto } from "@/app/workspace/pracownicy/types/user";

export type CreateUserData = CreateUserDto;

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/workspace/pracownicy/api");
      if (!response.ok) throw new Error("Nie udało się pobrać użytkowników");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się pobrać listy użytkowników",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserData) => {
    try {
      const response = await fetch("/workspace/pracownicy/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Nie udało się utworzyć użytkownika");

      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      
      toast({
        title: "Sukces",
        description: "Utworzono nowego użytkownika",
      });
      
      return newUser;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się utworzyć użytkownika",
      });
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/workspace/pracownicy/api`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId })
      });

      if (!response.ok) throw new Error('Nie udało się usunąć użytkownika');

      setUsers(prev => prev.filter(user => user.id.toString() !== userId.toString()));
      
      toast({
        title: "Sukces",
        description: "Usunięto użytkownika",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się usunąć użytkownika",
      });
    }
  };

  const updateUser = async (userId: number, userData: Partial<CreateUserData>) => {
    try {
      const response = await fetch(`/workspace/pracownicy/api`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...userData }),
      });

      if (!response.ok) throw new Error('Nie udało się zaktualizować użytkownika');

      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id.toString() === userId.toString() ? updatedUser : user
      ));
      
      toast({
        title: "Sukces",
        description: "Zaktualizowano dane użytkownika",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się zaktualizować użytkownika",
      });
    }
  };

  return { 
    users, 
    loading,
    createUser,
    deleteUser,
    updateUser,
    refreshUsers: fetchUsers
  };
} 