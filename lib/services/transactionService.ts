import { connectToDatabase, sql } from '@/lib/database/db';

export interface Transaction {
  Transaction_ID: number;
  User_ID: number;
  Title: string;
  Description: string;
  Amount: number;
  Category_ID: number;
  Category_Name: string;
  Type: 'Income' | 'Expense';
  Created_Date: Date;
}

export interface TransactionInput {
  title: string;
  description: string;
  amount: number;
  categoryId: number;
}

export interface TransactionResponse {
  Status: 'SUCCESS' | 'ERROR';
  Message: string;
  Transaction_ID?: number;
}

export class TransactionService {
  // Get all transactions (Income + Expense)
  static async getAllTransactions(userId: number, type?: 'Income' | 'Expense'): Promise<Transaction[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Type', sql.VarChar(20), type || null)
        .execute('GetAllTransactions');
      
      return result.recordset.map((row: any) => ({
        Transaction_ID: row.Transaction_ID,
        User_ID: row.User_ID,
        Title: row.Title,
        Description: row.Description,
        Amount: parseFloat(row.Amount),
        Category_ID: row.Category_ID,
        Category_Name: row.Category_Name,
        Type: row.Type,
        Created_Date: row.Created_Date
      }));
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  // Get transaction by ID
  static async getTransactionById(transactionId: number, type: 'Income' | 'Expense', userId: number): Promise<Transaction | null> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('TransactionID', sql.Int, transactionId)
        .input('Type', sql.VarChar(20), type)
        .input('UserID', sql.Int, userId)
        .execute('GetTransactionById');
      
      if (result.recordset.length === 0) {
        return null;
      }

      const row = result.recordset[0];
      return {
        Transaction_ID: row.Transaction_ID,
        User_ID: row.User_ID,
        Title: row.Title,
        Description: row.Description,
        Amount: parseFloat(row.Amount),
        Category_ID: row.Category_ID,
        Category_Name: row.Category_Name,
        Type: row.Type,
        Created_Date: row.Created_Date
      };
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      throw new Error('Failed to fetch transaction');
    }
  }

  // Add income transaction
  static async addIncomeTransaction(userId: number, transaction: TransactionInput): Promise<TransactionResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), transaction.title)
        .input('Description', sql.VarChar(255), transaction.description)
        .input('Amount', sql.Decimal(12, 2), transaction.amount)
        .input('CategoryID', sql.Int, transaction.categoryId)
        .execute('AddIncomeTransaction');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Transaction_ID: response.Transaction_ID
      };
    } catch (error) {
      console.error('Error adding income transaction:', error);
      throw new Error('Failed to add income transaction');
    }
  }

  // Add expense transaction
  static async addExpenseTransaction(userId: number, transaction: TransactionInput): Promise<TransactionResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), transaction.title)
        .input('Description', sql.VarChar(255), transaction.description)
        .input('Amount', sql.Decimal(12, 2), transaction.amount)
        .input('CategoryID', sql.Int, transaction.categoryId)
        .execute('AddExpenseTransaction');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Transaction_ID: response.Transaction_ID
      };
    } catch (error) {
      console.error('Error adding expense transaction:', error);
      throw new Error('Failed to add expense transaction');
    }
  }

  // Update income transaction
  static async updateIncomeTransaction(transactionId: number, userId: number, transaction: TransactionInput): Promise<TransactionResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('TransactionID', sql.Int, transactionId)
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), transaction.title)
        .input('Description', sql.VarChar(255), transaction.description)
        .input('Amount', sql.Decimal(12, 2), transaction.amount)
        .input('CategoryID', sql.Int, transaction.categoryId)
        .execute('UpdateIncomeTransaction');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error updating income transaction:', error);
      throw new Error('Failed to update income transaction');
    }
  }

  // Update expense transaction
  static async updateExpenseTransaction(transactionId: number, userId: number, transaction: TransactionInput): Promise<TransactionResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('TransactionID', sql.Int, transactionId)
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), transaction.title)
        .input('Description', sql.VarChar(255), transaction.description)
        .input('Amount', sql.Decimal(12, 2), transaction.amount)
        .input('CategoryID', sql.Int, transaction.categoryId)
        .execute('UpdateExpenseTransaction');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error updating expense transaction:', error);
      throw new Error('Failed to update expense transaction');
    }
  }

  // Delete income transaction
  static async deleteIncomeTransaction(transactionId: number, userId: number): Promise<TransactionResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('TransactionID', sql.Int, transactionId)
        .input('UserID', sql.Int, userId)
        .execute('DeleteIncomeTransaction');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error deleting income transaction:', error);
      throw new Error('Failed to delete income transaction');
    }
  }

  // Delete expense transaction
  static async deleteExpenseTransaction(transactionId: number, userId: number): Promise<TransactionResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('TransactionID', sql.Int, transactionId)
        .input('UserID', sql.Int, userId)
        .execute('DeleteExpenseTransaction');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error deleting expense transaction:', error);
      throw new Error('Failed to delete expense transaction');
    }
  }

  // Generic add transaction method
  static async addTransaction(userId: number, type: 'Income' | 'Expense', transaction: TransactionInput): Promise<TransactionResponse> {
    if (type === 'Income') {
      return this.addIncomeTransaction(userId, transaction);
    } else {
      return this.addExpenseTransaction(userId, transaction);
    }
  }

  // Generic update transaction method
  static async updateTransaction(transactionId: number, userId: number, type: 'Income' | 'Expense', transaction: TransactionInput): Promise<TransactionResponse> {
    if (type === 'Income') {
      return this.updateIncomeTransaction(transactionId, userId, transaction);
    } else {
      return this.updateExpenseTransaction(transactionId, userId, transaction);
    }
  }

  // Generic delete transaction method
  static async deleteTransaction(transactionId: number, userId: number, type: 'Income' | 'Expense'): Promise<TransactionResponse> {
    if (type === 'Income') {
      return this.deleteIncomeTransaction(transactionId, userId);
    } else {
      return this.deleteExpenseTransaction(transactionId, userId);
    }
  }
}
