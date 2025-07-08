import { connectToDatabase, sql } from '../../database/db';
import { RegisterRequest, User } from '../../types/user.types';

export class authQueries  {
  static async registerUser(userData: RegisterRequest): Promise<{ User_ID: number; Status: string }> {
    const pool = await connectToDatabase();
    
    const request = pool.request();
    request.input('Username', sql.NVarChar(50), userData.username);
    request.input('Password', sql.NVarChar(255), userData.password);
    request.input('Email', sql.NVarChar(100), userData.email);
    request.input('DateOfBirth', sql.Date, userData.dateOfBirth ? new Date(userData.dateOfBirth) : null);
    request.input('Address', sql.NVarChar(255), userData.address || null);
    request.input('Age', sql.Int, userData.age || null);
    request.input('Phone_No', sql.NVarChar(20), userData.phoneNo || null);
    request.input('Type', sql.NVarChar(20), userData.type);
    request.input('Guardian_Contact_No', sql.NVarChar(20), userData.guardianContactNo || null);
    request.input('Employment_Status', sql.NVarChar(50), userData.employmentStatus || null);
    
    const result = await request.execute('sp_RegisterUser');
    return result.recordset[0];
  }
  
  static async loginUser(email: string): Promise<User | null> {
    const pool = await connectToDatabase();
    
    const request = pool.request();
    request.input('Email', sql.NVarChar(100), email);
    
    const result = await request.execute('sp_LoginUser');
    return result.recordset[0] || null;
  }
}
