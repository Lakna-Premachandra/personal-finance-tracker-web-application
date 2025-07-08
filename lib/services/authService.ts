import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authQueries } from '../database/queries/auth';
import { RegisterRequest, LoginRequest } from '../types/user.types';
import { IAuthService } from '../interfaces/IAuthService';


export class AuthService implements IAuthService {
  async register(userData: RegisterRequest) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const registrationData = {
        ...userData,
        password: hashedPassword,
      };
      
      const result = await authQueries.registerUser(registrationData);
      
      if (result.Status === 'Success') {
        return {
          success: true,
          message: 'User registered successfully',
          userId: result.User_ID,
        };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
  
  async login(credentials: LoginRequest) {
    try {
      const user = await authQueries.loginUser(credentials.email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const isPasswordValid = await bcrypt.compare(credentials.password, user.Password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      const token = jwt.sign(
        { 
          userId: user.User_ID, 
          email: user.Email,
          type: user.Type 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );
      
      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.User_ID,
          username: user.Username,
          email: user.Email,
          type: user.Type,
        },
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logout(token: string) {
    try {
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error: any) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }
}
