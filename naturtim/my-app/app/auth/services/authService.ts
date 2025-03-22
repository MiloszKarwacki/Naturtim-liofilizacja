import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/config/constants";
import { User, AuthUser } from "../types/auth";
import { AuditLogService } from "./auditLogService";

export const AuthService = {
  async login(login: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { login },
      include: { permissions: true }
    });

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const { password: _ignore, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
  
  generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        login: user.login,
        username: user.username,
        userSurname: user.userSurname,
        permissions: user.permissions.map(p => p.name) 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
  },
  
  async handleSuccessfulLogin(user: User): Promise<string> {
    const token = this.generateToken(user);
    
    // Logowanie udanego logowania
    await AuditLogService.logLoginAttempt(
      user.login, 
      true, 
      user.id, 
      `${user.username || ""} ${user.userSurname || ""}`.trim()
    );
    
    return token;
  },
  
  async handleFailedLogin(login: string): Promise<void> {
    await AuditLogService.logLoginAttempt(login, false);
  },
  
  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      
      return await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { permissions: true }
      });
    } catch (e) {
      console.error("Błąd dekodowania tokenu:", e);
      return null;
    }
  },
  
  async logout(token: string): Promise<void> {
    let userId = 0;
    let userName = "Nieznany";
    
    if (token) {
      const user = await this.getUserFromToken(token);
      if (user) {
        userId = user.id;
        userName = `${user.username || ""} ${user.userSurname || ""}`.trim();
      }
    }
    
    await AuditLogService.logLogout(userId, userName);
  }
}; 