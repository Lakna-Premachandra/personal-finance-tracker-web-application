import { NextRequest, NextResponse } from 'next/server';
import { IAuthService } from '../interfaces/IAuthService';
import { AuthService } from '../services/authService';
import { ValidationService } from '../services/validationService';

export class AuthController {
  private authService: IAuthService;
  
  constructor(authService?: IAuthService) {
    this.authService = authService || new AuthService();
  }
  
  async register(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      
      const validationErrors = ValidationService.validateRegister(body);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Validation failed', 
            errors: validationErrors 
          },
          { status: 400 }
        );
      }
      
      const result = await this.authService.register(body);
      
      return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || 'Internal server error' 
        },
        { status: 500 }
      );
    }
  }
  
  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      
      const validationErrors = ValidationService.validateLogin(body);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Validation failed', 
            errors: validationErrors 
          },
          { status: 400 }
        );
      }
      
      const result = await this.authService.login(body);
      
      return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || 'Internal server error' 
        },
        { status: 401 }
      );
    }
  }

  async logout(request: NextRequest): Promise<NextResponse> {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'No token provided' 
          },
          { status: 401 }
        );
      }
      
      const token = authHeader.substring(7);
      
      const result = await this.authService.logout(token);
      
      return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || 'Internal server error' 
        },
        { status: 500 }
      );
    }
  }
}
