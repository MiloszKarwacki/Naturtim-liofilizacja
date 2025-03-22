// Podstawowe typy dla modułu pracowników

export interface Permission {
  id: number;
  name: string;
  href?: string;
  description?: string;
}

export interface User {
  id: number;
  login: string;
  username: string;
  userSurname: string;
  permissions: Permission[];
}

// DTO (Data Transfer Object) do tworzenia użytkownika
export interface CreateUserDto {
  login: string;
  password: string;
  username?: string;
  userSurname?: string;
  permissions?: string[];
}

// DTO do aktualizacji użytkownika
export interface UpdateUserDto {
  username?: string;
  userSurname?: string;
  password?: string;
  permissions?: string[];
}
