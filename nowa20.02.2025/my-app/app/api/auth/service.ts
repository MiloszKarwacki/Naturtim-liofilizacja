import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

export interface AuthResponse {
  id: number;
  login: string;
  permissions: any[];
}

export const AuthService = {
  async login(login: string, password: string): Promise<AuthResponse | null> {
    const user = await prisma.user.findUnique({
      where: { login },
      include: { permissions: true }
    });

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const { password: _ignore, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}; 