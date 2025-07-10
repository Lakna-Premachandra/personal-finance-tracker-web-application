import { NextRequest, NextResponse  } from 'next/server';
import { AuthService } from '@/lib/services/authService';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await authService.register(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
