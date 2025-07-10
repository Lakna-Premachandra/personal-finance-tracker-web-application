import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase, sql } from '../database/db';
import { RegisterRequest, LoginRequest, User } from '../../types/user.types';

export class AuthService {
  async register(data: RegisterRequest) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const pool = await connectToDatabase();
    const request = pool.request();

    request.input('Username', sql.NVarChar(50), data.username);
    request.input('Password', sql.NVarChar(255), hashedPassword);
    request.input('Email', sql.NVarChar(100), data.email);
    request.input('DateOfBirth', sql.Date, data.dateOfBirth ? new Date(data.dateOfBirth) : null);
    request.input('Address', sql.NVarChar(255), data.address || null);
    request.input('Age', sql.Int, data.age || null);
    request.input('Phone_No', sql.NVarChar(20), data.phoneNo || null);
    request.input('Type', sql.NVarChar(20), data.type);
    request.input('Guardian_Contact_No', sql.NVarChar(20), data.guardianContactNo || null);
    request.input('Employment_Status', sql.NVarChar(50), data.employmentStatus || null);

    const result = await request.execute('sp_RegisterUser');
    const response = result.recordset[0];

    if (response.Status === 'Success') {
      return {
        success: true,
        message: 'User registered successfully',
        userId: response.User_ID,
      };
    } else {
      throw new Error('Registration failed');
    }
  }

  async login(data: LoginRequest) {
    const pool = await connectToDatabase();
    const request = pool.request();

    request.input('Email', sql.NVarChar(100), data.email);

    const result = await request.execute('sp_LoginUser');
    const user: User = result.recordset[0];

    if (!user) throw new Error('Invalid credentials');

    const validPassword = await bcrypt.compare(data.password, user.Password);
    if (!validPassword) throw new Error('Invalid credentials');

    const token = jwt.sign(
      {
        userId: user.User_ID,
        email: user.Email,
        type: user.Type,
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
  }
}
