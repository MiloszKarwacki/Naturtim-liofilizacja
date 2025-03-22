import { Permission as DbPermission } from "@/types/permissions";

// Uproszczony typ Permission używany w kontekście autentykacji
export interface AuthPermission {
  id: number;
  name: string;
}

// Podstawowy interfejs użytkownika
export interface User {
  id: number;
  login: string;
  username?: string;
  userSurname?: string;
  permissions: AuthPermission[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfejs dla zalogowanego użytkownika (z tokenem)
export interface AuthUser {
  id: number;
  login: string;
  username?: string;
  userSurname?: string;
  permissions: string[];
}

// DTO dla tworzenia użytkownika
export interface CreateUserDto {
  login: string;
  password: string;
  username: string;
  userSurname: string;
  permissions: string[];
}

// DTO dla aktualizacji użytkownika
export interface UpdateUserDto {
  username?: string;
  userSurname?: string;
  password?: string;
  permissions?: string[];
}

// Odpowiedź z serwera po zalogowaniu
export interface LoginResponse {
  message: string;
  user: User;
  token: string;
} 