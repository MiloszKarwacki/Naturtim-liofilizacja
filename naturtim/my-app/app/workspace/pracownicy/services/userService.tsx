import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { CreateUserDto, UpdateUserDto, User } from "../types/user";
import { NextRequest } from "next/server";
import { UserLogService } from "./userLogService";

// Serwis do operacji na użytkownikach
export const userService = {
  /**
   * Pobiera wszystkich użytkowników
   */
  async getAll(): Promise<User[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        login: true,
        username: true,
        userSurname: true,
        permissions: true
      }
    });
  },

  /**
   * Tworzy nowego użytkownika
   */
  async create(data: CreateUserDto, request?: NextRequest): Promise<User> {
    const hashedPassword = await hash(data.password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        login: data.login,
        password: hashedPassword,
        username: data.username || "",
        userSurname: data.userSurname || "",
        permissions: {
          connect: data.permissions?.map(permissionName => ({ 
            name: permissionName 
          })) || []
        }
      },
      select: {
        id: true,
        login: true,
        username: true,
        userSurname: true,
        permissions: true
      }
    });
    
    // Logowanie utworzenia pracownika
    if (request) {
      await UserLogService.logUserCreation(request, newUser.id, newUser.login);
    }
    
    return newUser;
  },

  /**
   * Usuwa użytkownika po ID
   */
  async delete(id: number, request?: NextRequest): Promise<void> {
    // Pobierz dane użytkownika przed usunięciem
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    await prisma.user.delete({
      where: { id }
    });
    
    // Logowanie usunięcia pracownika
    if (request && user) {
      await UserLogService.logUserDeletion(request, id, user.login);
    }
  },

  /**
   * Aktualizuje dane użytkownika
   */
  async update(id: number, data: UpdateUserDto, request?: NextRequest): Promise<User> {
    const updateData: any = {
      username: data.username,
      userSurname: data.userSurname,
    };

    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    // Pobierz dane użytkownika przed aktualizacją, włącznie z uprawnieniami
    const user = await prisma.user.findUnique({
      where: { id },
      include: { permissions: true }
    });

    // Przygotuj zmienne do śledzenia zmian uprawnień
    let permissionChanges;
    
    if (data.permissions) {
      // Pobierz aktualne uprawnienia użytkownika jako tablica nazw
      const currentPermissions = user?.permissions.map(p => p.name) || [];
      
      // Znajdź dodane uprawnienia (te, które są w nowej liście, ale nie było ich wcześniej)
      const addedPermissions = data.permissions.filter(p => !currentPermissions.includes(p));
      
      // Znajdź usunięte uprawnienia (te, które były wcześniej, ale nie ma ich w nowej liście)
      const removedPermissions = currentPermissions.filter(p => !data.permissions?.includes(p) || !data.permissions);
      
      // Zapisz zmiany uprawnień do zalogowania
      permissionChanges = {
        added: addedPermissions,
        removed: removedPermissions
      };
      
      // Używamy "set" aby całkowicie zastąpić wszystkie uprawnienia
      updateData.permissions = {
        set: [], 
        connect: data.permissions.map(permissionName => ({ 
          name: permissionName 
        }))
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        login: true,
        username: true,
        userSurname: true,
        permissions: true
      }
    });
    
    // Logowanie aktualizacji pracownika
    if (request && user) {
      // Ustal, które pola zostały zmienione
      const updatedFields = [];
      if (data.username) updatedFields.push('imię');
      if (data.userSurname) updatedFields.push('nazwisko');
      if (data.permissions) updatedFields.push('uprawnienia');
      
      await UserLogService.logUserUpdate(
        request, 
        id, 
        user.login, 
        updatedFields,
        permissionChanges  // Przekaż informacje o zmianie uprawnień
      );
    }
    
    return updatedUser;
  }
};
