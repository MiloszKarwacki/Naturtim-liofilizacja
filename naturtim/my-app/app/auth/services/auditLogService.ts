import prisma from "@/lib/prisma";

export const AuditLogService = {
  async logLoginAttempt(login: string, success: boolean, userId: number = 0, userName: string = "Nieznany"): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        description: success 
          ? `Użytkownik zalogował się do systemu` 
          : `Nieudana próba logowania (login: ${login})`,
        details: !success ? JSON.stringify({ login, success }) : null
      }
    });
  },
  
  async logLogout(userId: number, userName: string): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        description: `Użytkownik wylogował się z systemu`,
        details: null
      }
    });
  }
}; 