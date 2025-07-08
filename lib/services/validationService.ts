import { RegisterRequest, LoginRequest } from '../types/user.types';

export class ValidationService {
  static validateRegister(data: RegisterRequest): string[] {
    const errors: string[] = [];
    
    if (!data.username || data.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }
    
    if (!data.type || !['Young-Adult', 'Student'].includes(data.type)) {
      errors.push('Type must be either Young-Adult or Student');
    }
    
    if (data.type === 'Student' && !data.guardianContactNo) {
      errors.push('Guardian contact number is required for students');
    }
    
    if (data.type === 'Young-Adult' && !data.employmentStatus) {
      errors.push('Employment status is required for young adults');
    }
    
    return errors;
  }
  
  static validateLogin(data: LoginRequest): string[] {
    const errors: string[] = [];
    
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }
    
    if (!data.password) {
      errors.push('Password is required');
    }
    
    return errors;
  }
  
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
