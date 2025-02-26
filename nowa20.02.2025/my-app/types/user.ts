import { Permission } from "./permissions";

export interface User {
  id: number;
  login: string;
  username: string;
  userSurname: string;
  permissions: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserDto {
  login: string;
  password: string;
  username: string;
  userSurname: string;
  permissions: string[];
}

export interface UpdateUserDto {
  username?: string;
  userSurname?: string;
  password?: string;
  permissions?: string[];
}

interface UpdateEmployeeData {
  username: string;
  userSurname: string;
  permissions: string[];
}