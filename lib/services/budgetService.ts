import { connectToDatabase, sql } from '@/lib/database/db';

export interface Budget {
  Budget_ID: number;
  User_ID: number;
  Category_ID: number;
  Amount: number;
  Year: number;
  Month: number;
  Created_Date: Date;
  Updated_Date: Date;
  Category_Name?: string; // For joined queries
}

export interface BudgetWithCategory extends Budget {
  Category_Name: string;
  Category_Type: 'Income' | 'Expense';
}

export interface BudgetResponse {
  Status: 'SUCCESS' | 'ERROR';
  Message: string;
  Budget_ID?: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  budgetCount: number;
  overBudgetCount: number;
}

export class BudgetService {
  // Add a new budget
  static async addBudget(
    userId: number,
    categoryId: number,
    amount: number,
    year: number,
    month: number
  ): Promise<BudgetResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('CategoryID', sql.Int, categoryId)
        .input('Amount', sql.Decimal(12, 2), amount)
        .input('Year', sql.Int, year)
        .input('Month', sql.TinyInt, month)
        .execute('AddBudget');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Budget_ID: response.Budget_ID
      };
    } catch (error) {
      console.error('Error adding budget:', error);
      throw new Error('Failed to add budget');
    }
  }

  // Get budget by ID
  static async getBudgetById(budgetId: number, userId: number): Promise<BudgetWithCategory | null> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('BudgetID', sql.Int, budgetId)
        .input('UserID', sql.Int, userId)
        .execute('GetBudgetById');

      const row = result.recordset[0];
      if (!row) return null;

      return {
        Budget_ID: row.Budget_ID,
        User_ID: row.User_ID,
        Category_ID: row.Category_ID,
        Amount: row.Amount,
        Year: row.Year,
        Month: row.Month,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date,
        Category_Name: row.Category_Name,
        Category_Type: row.Category_Type
      };
    } catch (error) {
      console.error('Error getting budget by ID:', error);
      throw new Error('Failed to fetch budget');
    }
  }

  // Get all budgets for a user
  static async getAllBudgets(userId: number): Promise<BudgetWithCategory[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetAllBudgets');
      
      return result.recordset.map((row: any) => ({
        Budget_ID: row.Budget_ID,
        User_ID: row.User_ID,
        Category_ID: row.Category_ID,
        Amount: row.Amount,
        Year: row.Year,
        Month: row.Month,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date,
        Category_Name: row.Category_Name,
        Category_Type: row.Category_Type
      }));
    } catch (error) {
      console.error('Error getting all budgets:', error);
      throw new Error('Failed to fetch budgets');
    }
  }

  // Get budgets by year and month
  static async getBudgetsByMonth(
    userId: number,
    year: number,
    month: number
  ): Promise<BudgetWithCategory[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Year', sql.Int, year)
        .input('Month', sql.TinyInt, month)
        .execute('GetBudgetsByMonth');
      
      return result.recordset.map((row: any) => ({
        Budget_ID: row.Budget_ID,
        User_ID: row.User_ID,
        Category_ID: row.Category_ID,
        Amount: row.Amount,
        Year: row.Year,
        Month: row.Month,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date,
        Category_Name: row.Category_Name,
        Category_Type: row.Category_Type
      }));
    } catch (error) {
      console.error('Error getting budgets by month:', error);
      throw new Error('Failed to fetch budgets by month');
    }
  }

  // Get budgets by year
  static async getBudgetsByYear(userId: number, year: number): Promise<BudgetWithCategory[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Year', sql.Int, year)
        .execute('GetBudgetsByYear');
      
      return result.recordset.map((row: any) => ({
        Budget_ID: row.Budget_ID,
        User_ID: row.User_ID,
        Category_ID: row.Category_ID,
        Amount: row.Amount,
        Year: row.Year,
        Month: row.Month,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date,
        Category_Name: row.Category_Name,
        Category_Type: row.Category_Type
      }));
    } catch (error) {
      console.error('Error getting budgets by year:', error);
      throw new Error('Failed to fetch budgets by year');
    }
  }

  // Update budget
  static async updateBudget(
    budgetId: number,
    userId: number,
    categoryId: number,
    amount: number,
    year: number,
    month: number
  ): Promise<BudgetResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('BudgetID', sql.Int, budgetId)
        .input('UserID', sql.Int, userId)
        .input('CategoryID', sql.Int, categoryId)
        .input('Amount', sql.Decimal(12, 2), amount)
        .input('Year', sql.Int, year)
        .input('Month', sql.TinyInt, month)
        .execute('UpdateBudget');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error updating budget:', error);
      throw new Error('Failed to update budget');
    }
  }

  // Delete budget
  static async deleteBudget(budgetId: number, userId: number): Promise<BudgetResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('BudgetID', sql.Int, budgetId)
        .input('UserID', sql.Int, userId)
        .execute('DeleteBudget');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw new Error('Failed to delete budget');
    }
  }

  // Get budget summary for a specific month
  static async getBudgetSummary(userId: number, year: number, month: number): Promise<BudgetSummary> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Year', sql.Int, year)
        .input('Month', sql.TinyInt, month)
        .execute('GetBudgetSummary');
      
      const row = result.recordset[0];
      return {
        totalBudget: row.TotalBudget || 0,
        totalSpent: row.TotalSpent || 0,
        remaining: row.Remaining || 0,
        budgetCount: row.BudgetCount || 0,
        overBudgetCount: row.OverBudgetCount || 0
      };
    } catch (error) {
      console.error('Error getting budget summary:', error);
      throw new Error('Failed to fetch budget summary');
    }
  }

  // Get budget vs actual spending comparison
  static async getBudgetVsActual(
    userId: number,
    year: number,
    month: number
  ): Promise<Array<{
    Budget_ID: number;
    Category_ID: number;
    Category_Name: string;
    Budget_Amount: number;
    Actual_Amount: number;
    Difference: number;
    Percentage_Used: number;
    Status: 'Under' | 'Over' | 'Exact';
  }>> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Year', sql.Int, year)
        .input('Month', sql.TinyInt, month)
        .execute('GetBudgetVsActual');
      
      return result.recordset.map((row: any) => ({
        Budget_ID: row.Budget_ID,
        Category_ID: row.Category_ID,
        Category_Name: row.Category_Name,
        Budget_Amount: row.Budget_Amount,
        Actual_Amount: row.Actual_Amount,
        Difference: row.Difference,
        Percentage_Used: row.Percentage_Used,
        Status: row.Status
      }));
    } catch (error) {
      console.error('Error getting budget vs actual:', error);
      throw new Error('Failed to fetch budget vs actual comparison');
    }
  }

  // Check if budget exists for category in specific month
  static async checkBudgetExists(
    userId: number,
    categoryId: number,
    year: number,
    month: number,
    excludeBudgetId?: number
  ): Promise<boolean> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('CategoryID', sql.Int, categoryId)
        .input('Year', sql.Int, year)
        .input('Month', sql.TinyInt, month)
        .input('ExcludeBudgetID', sql.Int, excludeBudgetId || null)
        .execute('CheckBudgetExists');
      
      return result.recordset[0].Exists;
    } catch (error) {
      console.error('Error checking budget existence:', error);
      throw new Error('Failed to check budget existence');
    }
  }
}
