import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export interface CreateUserData {
  login: string;
  password: string;
  username?: string;
  userSurname?: string;
  permissions?: string[];
}

export const UserService = {
  async getAll() {
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

  async create(data: CreateUserData) {
    const hashedPassword = await hash(data.password, 10);
    
    return prisma.user.create({
      data: {
        login: data.login,
        password: hashedPassword,
        username: data.username,
        userSurname: data.userSurname,
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
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id: Number(id) }
    });
  },

  async update(id: string, data: Partial<CreateUserData>) {
    const updateData: any = {
      username: data.username,
      userSurname: data.userSurname,
    };

    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    if (data.permissions) {
      updateData.permissions = {
        set: [], // Usuń wszystkie obecne uprawnienia
        connect: data.permissions.map(permissionName => ({ 
          name: permissionName 
        }))
      };
    }

    return prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        login: true,
        username: true,
        userSurname: true,
        permissions: true
      }
    });
  }
}; 