import sql from 'mssql';
import { dbConfig } from '@/config/database';

let pool: sql.ConnectionPool | null = null;

export async function connectToDatabase(): Promise<sql.ConnectionPool> {
  try {
    if (pool) {
      return pool;
    }

    pool = await sql.connect(dbConfig);
    console.log('Connected to SQL Server database');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await connectToDatabase();
    const result = await connection.request().query('SELECT 1 as test');
    console.log('Database connection test successful:', result.recordset);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}