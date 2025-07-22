import { connectToDatabase, sql } from '@/lib/database/db';
import { BudgetService } from './budgetService';

export interface Transaction {
  Transaction_ID: number;
  User_ID: number;
  Title: string;
  Description: string;
  Amount: number;
  Category_ID: number;
  Category_Name: string;
  Type: 'Income' | 'Expense';
  Transaction_Date: Date;
  Created_Date: Date;
}

export interface TransactionInput {
  title: string;
  description: string;
  amount: number;
  categoryId: number;
  transactionDate?: Date | string;
}

export interface TransactionResponse {
  Status: 'SUCCESS' | 'ERROR';
  Message: string;
  Transaction_ID?: number;
}

export interface TransactionWithBudgetInfo extends TransactionResponse {
  budgetStatus?: {
    hasBudget: boolean;
    categoryName: string;
    budgetAmount?: number;
    spentAmount?: number;
    remainingAmount?: number;
    percentageUsed?: number;
    status?: string;
  };
}

export class TransactionService {
  // Helper method to parse transaction date
  private static parseTransactionDate(dateInput?: Date | string): Date | null {
    if (!dateInput) return null;
    
    if (typeof dateInput === 'string') {
      const parsedDate = new Date(dateInput);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
    
    return dateInput instanceof Date ? dateInput : null;
  }

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
        Transaction_Date: row.Transaction_Date,
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
        Transaction_Date: row.Transaction_Date,
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
      const request = pool.request()
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), transaction.title)
        .input('Description', sql.VarChar(255), transaction.description)
        .input('Amount', sql.Decimal(12, 2), transaction.amount)
        .input('CategoryID', sql.Int, transaction.categoryId);

      // Add transaction date if provided
      const transactionDate = this.parseTransactionDate(transaction.transactionDate);
      if (transactionDate) {
        request.input('TransactionDate', sql.Date, transactionDate);
      }

      const result = await request.execute('AddIncomeTransaction');
      
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
  static async addExpenseTransaction(userId: number, transaction: TransactionInput): Promise<TransactionWithBudgetInfo> {
    try {
      const pool = await connectToDatabase();
      const request = pool.request()
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), transaction.title)
        .input('Description', sql.VarChar(255), transaction.description)
        .input('Amount', sql.Decimal(12, 2), transaction.amount)
        .input('CategoryID', sql.Int, transaction.categoryId);

      // Add transaction date if provided
      const transactionDate = this.parseTransactionDate(transaction.transactionDate);
      if (transactionDate) {
        request.input('TransactionDate', sql.Date, transactionDate);
      }

      const result = await request.execute('AddExpenseTransaction');
      
      const response = result.recordset[0];
      // If transaction was successful, get updated budget status
      let budgetStatus = null;
      if (response.Status === 'SUCCESS') {
        const transactionDate = new Date(transaction.transactionDate || new Date());
        const year = transactionDate.getFullYear();
        const month = transactionDate.getMonth() + 1;

        try {
          budgetStatus = await BudgetService.getBudgetStatus(
            userId, 
            transaction.categoryId, 
            year, 
            month
          );
        } catch (budgetError) {
          console.log('No budget found for this category and month:', budgetError);
        }
      }

      return {
        Status: response.Status,
        Message: response.Message,
        Transaction_ID: response.Transaction_ID,
        budgetStatus: budgetStatus ? {
          hasBudget: true,
          categoryName: budgetStatus.Category_Name,
          budgetAmount: budgetStatus.Budget_Amount,
          spentAmount: budgetStatus.Spent_Amount,
          remainingAmount: budgetStatus.Remaining_Amount,
          percentageUsed: Math.round(budgetStatus.Percentage_Used),
          status: budgetStatus.Status
        } : {
          hasBudget: false,
          categoryName: 'Unknown Category'
        }
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
      const request = pool.request()
        .input('TransactionID', sql.Int, transactionId)
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), transaction.title)
        .input('Description', sql.VarChar(255), transaction.description)
        .input('Amount', sql.Decimal(12, 2), transaction.amount)
        .input('CategoryID', sql.Int, transaction.categoryId);

      // Add transaction date if provided
      const transactionDate = this.parseTransactionDate(transaction.transactionDate);
      if (transactionDate) {
        request.input('TransactionDate', sql.Date, transactionDate);
      }

      const result = await request.execute('UpdateIncomeTransaction');
      
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
  static async updateExpenseTransaction(transactionId: number, userId: number, transaction: TransactionInput): Promise<TransactionWithBudgetInfo> {
    try {
      const pool = await connectToDatabase();
      const request = pool.request()
        .input('TransactionID', sql.Int, transactionId)
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), transaction.title)
        .input('Description', sql.VarChar(255), transaction.description)
        .input('Amount', sql.Decimal(12, 2), transaction.amount)
        .input('CategoryID', sql.Int, transaction.categoryId);

      // Add transaction date if provided
      const transactionDate = this.parseTransactionDate(transaction.transactionDate);
      if (transactionDate) {
        request.input('TransactionDate', sql.Date, transactionDate);
      }

      const result = await request.execute('UpdateExpenseTransaction');
      
      const response = result.recordset[0];
      // If transaction was updated successfully, get updated budget status
      let budgetStatus = null;
      if (response.Status === 'SUCCESS') {
        const transactionDate = new Date(transaction.transactionDate || new Date());
        const year = transactionDate.getFullYear();
        const month = transactionDate.getMonth() + 1;

        try {
          budgetStatus = await BudgetService.getBudgetStatus(
            userId, 
            transaction.categoryId, 
            year, 
            month
          );
        } catch (budgetError) {
          console.log('No budget found for this category and month:', budgetError);
        }
      }

      return {
        Status: response.Status,
        Message: response.Message,
        budgetStatus: budgetStatus ? {
          hasBudget: true,
          categoryName: budgetStatus.Category_Name,
          budgetAmount: budgetStatus.Budget_Amount,
          spentAmount: budgetStatus.Spent_Amount,
          remainingAmount: budgetStatus.Remaining_Amount,
          percentageUsed: Math.round(budgetStatus.Percentage_Used),
          status: budgetStatus.Status
        } : {
          hasBudget: false,
          categoryName: 'Unknown Category'
        }
      };
    } catch (error) {
      console.error('Error updating expense transaction:', error);
      throw new Error('Failed to update expense transaction');
    }
  }

  // Delete income transaction (no changes needed)
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

  // Delete expense transaction (no changes needed)
  static async deleteExpenseTransaction(transactionId: number, userId: number, categoryId: number, transactionDate: string): Promise<TransactionWithBudgetInfo> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('TransactionID', sql.Int, transactionId)
        .input('UserID', sql.Int, userId)
        .execute('DeleteExpenseTransaction');
      
      const response = result.recordset[0];
      // If transaction was deleted successfully, get updated budget status
      let budgetStatus = null;
      if (response.Status === 'SUCCESS') {
        const date = new Date(transactionDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        try {
          budgetStatus = await BudgetService.getBudgetStatus(
            userId, 
            categoryId, 
            year, 
            month
          );
        } catch (budgetError) {
          console.log('No budget found for this category and month:', budgetError);
        }
      }

      return {
        Status: response.Status,
        Message: response.Message,
        budgetStatus: budgetStatus ? {
          hasBudget: true,
          categoryName: budgetStatus.Category_Name,
          budgetAmount: budgetStatus.Budget_Amount,
          spentAmount: budgetStatus.Spent_Amount,
          remainingAmount: budgetStatus.Remaining_Amount,
          percentageUsed: Math.round(budgetStatus.Percentage_Used),
          status: budgetStatus.Status
        } : {
          hasBudget: false,
          categoryName: 'Unknown Category'
        }
      };
    } catch (error) {
      console.error('Error deleting expense transaction:', error);
      throw new Error('Failed to delete expense transaction');
    }
  }

  // Get transactions by date range
  static async getTransactionsByDateRange(
    userId: number, 
    startDate: string, 
    endDate: string, 
    type?: 'Income' | 'Expense'
  ): Promise<Transaction[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('StartDate', sql.Date, startDate)
        .input('EndDate', sql.Date, endDate)
        .input('Type', sql.VarChar(10), type || null)
        .execute('GetTransactionsByDateRange');
      
      return result.recordset.map((row: any) => ({
        Transaction_ID: row.Transaction_ID,
        User_ID: row.User_ID,
        Title: row.Title,
        Description: row.Description,
        Amount: row.Amount,
        Type: row.Type || row.Category_Type,
        Category_ID: row.Category_ID,
        Category_Name: row.Category_Name,
        Category_Type: row.Category_Type,
        Transaction_Date: row.Transaction_Date,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date
      }));
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      throw new Error('Failed to fetch transactions by date range');
    }
  }

  // Get transactions by category
  static async getTransactionsByCategory(
    userId: number, 
    categoryId: number, 
    type?: 'Income' | 'Expense'
  ): Promise<Transaction[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('CategoryID', sql.Int, categoryId)
        .input('Type', sql.VarChar(10), type || null)
        .execute('GetTransactionsByCategory');
      
      return result.recordset.map((row: any) => ({
        Transaction_ID: row.Transaction_ID,
        User_ID: row.User_ID,
        Title: row.Title,
        Description: row.Description,
        Amount: row.Amount,
        Type: row.Type || row.Category_Type,
        Category_ID: row.Category_ID,
        Category_Name: row.Category_Name,
        Category_Type: row.Category_Type,
        Transaction_Date: row.Transaction_Date,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date
      }));
    } catch (error) {
      console.error('Error getting transactions by category:', error);
      throw new Error('Failed to fetch transactions by category');
    }
  }

  // Get monthly spending summary with budget comparison
  static async getMonthlySpendingSummary(
    userId: number, 
    year: number, 
    month: number
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    budgetSummary: any;
    categoryBreakdown: Array<{
      categoryId: number;
      categoryName: string;
      totalSpent: number;
      budgetAmount?: number;
      remainingBudget?: number;
      percentageUsed?: number;
      status?: string;
    }>;
  }> {
    try {
      // Get all transactions for the month
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
      
      const [incomeTransactions, expenseTransactions, budgetSummary, budgetCategories] = await Promise.all([
        this.getTransactionsByDateRange(userId, startDate, endDate, 'Income'),
        this.getTransactionsByDateRange(userId, startDate, endDate, 'Expense'),
        BudgetService.getBudgetSummary(userId, year, month),
        BudgetService.getBudgetCategoriesWithStatus(userId, year, month)
      ]);

      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.Amount, 0);
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.Amount, 0);

      // Create category breakdown with budget comparison
      const categoryMap = new Map();
      
      // Add expense data
      expenseTransactions.forEach(transaction => {
        const key = transaction.Category_ID;
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            categoryId: transaction.Category_ID,
            categoryName: transaction.Category_Name || 'Unknown',
            totalSpent: 0
          });
        }
        categoryMap.get(key).totalSpent += transaction.Amount;
      });

      // Add budget data
      budgetCategories.forEach(budget => {
        const key = budget.Category_ID;
        if (categoryMap.has(key)) {
          const category = categoryMap.get(key);
          category.budgetAmount = budget.Budget_Amount;
          category.remainingBudget = budget.Remaining_Amount;
          category.percentageUsed = budget.Percentage_Used;
          category.status = budget.Status;
        } else if (budget.Budget_Amount > 0) {
          // Budget exists but no spending yet
          categoryMap.set(key, {
            categoryId: budget.Category_ID,
            categoryName: budget.Category_Name,
            totalSpent: 0,
            budgetAmount: budget.Budget_Amount,
            remainingBudget: budget.Remaining_Amount,
            percentageUsed: 0,
            status: 'Under Budget'
          });
        }
      });

      return {
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        budgetSummary,
        categoryBreakdown: Array.from(categoryMap.values())
      };
    } catch (error) {
      console.error('Error getting monthly spending summary:', error);
      throw new Error('Failed to fetch monthly spending summary');
    }
  }
}
