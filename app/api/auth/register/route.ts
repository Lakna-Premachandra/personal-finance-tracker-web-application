import { NextRequest } from 'next/server';
import { AuthController } from '@/lib/controllers/authController';

const authController = new AuthController();

export async function POST(request: NextRequest) {
  return authController.register(request);
}
