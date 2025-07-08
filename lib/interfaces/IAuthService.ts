import { RegisterRequest, LoginRequest } from '../types/user.types';

export interface IAuthService {
  register(userData: RegisterRequest): Promise<{
    success: boolean;
    message: string;
    userId?: number;
  }>;
  
  login(credentials: LoginRequest): Promise<{
    success: boolean;
    message: string;
    token?: string;
    user?: {
      id: number;
      username: string;
      email: string;
      type: string;
    };
  }>;

  logout(token: string): Promise<{
    success: boolean;
    message: string;
  }>;
}
