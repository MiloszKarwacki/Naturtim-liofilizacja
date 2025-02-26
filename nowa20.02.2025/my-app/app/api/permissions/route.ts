import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const login = cookieStore.get('user_login')?.value;

    if (!login) {
      return NextResponse.json({ permissions: [] });
    }

    const user = await prisma.user.findUnique({
      where: { login },
      include: { permissions: true }
    });

    return NextResponse.json({ permissions: user?.permissions || [] });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json({ permissions: [] }, { status: 500 });
  }
} 