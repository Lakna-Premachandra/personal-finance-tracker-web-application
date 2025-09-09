import { connectToDatabase, sql } from '@/lib/database/db';

export interface YoungAdultDashboardSummary {
  totalBalance: number;
  balanceChangePercentage: number;
  monthlyIncome: number;
  incomeChangePercentage: number;
  monthlyExpenses: number;
  expenseChangePercentage: number;
  savingsGoalPercentage: number;
  totalGoalTargetAmount: number;
  totalGoalCurrentAmount: number;
}

export interface Transaction {
  type: 'Income' | 'Expense';
  title: string;
  amount: number;
  createdDate: Date;
  categoryName: string;
}

export interface PaymentReminder {
  reminderId: number;
  title: string;
  amount: number;
  category: string;
  dueDate: Date;
  nextDueDate: Date;
  remindDaysBefore: number;
  frequency: string;
  priority: 'high priority' | 'medium priority' | 'low priority';
}

export interface ExpenseBreakdown {
  categoryName: string;
  categoryId: number;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface FinancialTrend {
  year: number;
  month: number;
  monthName: string;
  income: number;
  expenses: number;
  savings: number;
  netAmount: number;
}

export interface FinancialTrendsData {
  trends: FinancialTrend[];
  averages: {
    avgIncome: number;
    avgExpenses: number;
    avgSavings: number;
  };
}

export interface BudgetStatus {
  budgetId: number;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: 'Over Budget' | 'Exact Budget' | 'On Track';
}

export class YoungAdultDashboardService {
  // Get complete dashboard data
  static async getDashboardData(userId: number) {
    try {
      const [
        summary,
        recentTransactions,
        paymentReminders,
        expenseBreakdown,
        financialTrends,
        currentBudgets
      ] = await Promise.all([
        this.getSummary(userId),
        this.getRecentTransactions(userId),
        this.getPaymentReminders(userId),
        this.getExpenseBreakdown(userId),
        this.getFinancialTrends(userId),
        this.getCurrentBudgets(userId)
      ]);

      return {
        summary,
        recentTransactions,
        paymentReminders,
        expenseBreakdown,
        financialTrends,
        currentBudgets
      };
    } catch (error) {
      console.error('Error getting complete young adult dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  // Get dashboard summary
  static async getSummary(userId: number): Promise<YoungAdultDashboardSummary> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetUserDashboardSummary');
      
      const row = result.recordset[0];
      return {
        totalBalance: row.TotalBalance || 0,
        balanceChangePercentage: Math.round((row.BalanceChangePercentage || 0) * 100) / 100,
        monthlyIncome: row.MonthlyIncome || 0,
        incomeChangePercentage: Math.round((row.IncomeChangePercentage || 0) * 100) / 100,
        monthlyExpenses: row.MonthlyExpenses || 0,
        expenseChangePercentage: Math.round((row.ExpenseChangePercentage || 0) * 100) / 100,
        savingsGoalPercentage: Math.round(row.SavingsGoalPercentage || 0),
        totalGoalTargetAmount: row.TotalGoalTargetAmount || 0,
        totalGoalCurrentAmount: row.TotalGoalCurrentAmount || 0
      };
    } catch (error) {
      console.error('Error getting young adult dashboard summary:', error);
      throw new Error('Failed to fetch dashboard summary');
    }
  }

  // Get recent transactions
  static async getRecentTransactions(userId: number, limit: number = 5): Promise<Transaction[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Limit', sql.Int, limit)
        .execute('GetRecentTransactions');
      
      return result.recordset.map((row: any) => ({
        type: row.Type,
        title: row.Title,
        amount: row.Amount,
        createdDate: row.Created_Date,
        categoryName: row.CategoryName || 'Uncategorized'
      }));
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      throw new Error('Failed to fetch recent transactions');
    }
  }

  // Get payment reminders
  static async getPaymentReminders(userId: number, limit: number = 5): Promise<PaymentReminder[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Limit', sql.Int, limit)
        .execute('GetUpcomingPaymentReminders');
      
      return result.recordset.map((row: any) => ({
        reminderId: row.Reminder_ID,
        title: row.Title,
        amount: row.Amount,
        category: row.Category,
        dueDate: row.Due_Date,
        nextDueDate: row.Next_Due_Date,
        remindDaysBefore: row.Remind_Days_Before,
        frequency: row.Frequency,
        priority: row.Priority
      }));
    } catch (error) {
      console.error('Error getting payment reminders:', error);
      throw new Error('Failed to fetch payment reminders');
    }
  }

  // Get expense breakdown
  static async getExpenseBreakdown(userId: number, year?: number, month?: number): Promise<ExpenseBreakdown[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Year', sql.Int, year || null)
        .input('Month', sql.Int, month || null)
        .execute('GetMonthlyExpenseBreakdown');
      
      return result.recordset.map((row: any) => ({
        categoryName: row.CategoryName,
        categoryId: row.Category_ID,
        totalAmount: row.TotalAmount,
        transactionCount: row.TransactionCount,
        percentage: Math.round(row.Percentage || 0)
      }));
    } catch (error) {
      console.error('Error getting expense breakdown:', error);
      throw new Error('Failed to fetch expense breakdown');
    }
  }

  // Get financial trends (6-month overview)
  static async getFinancialTrends(userId: number): Promise<FinancialTrendsData> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetFinancialTrends');

      const recordsets = result.recordsets as any[];

      const trendsData = recordsets[0] as any[];
      const averagesData = (recordsets[1] as any[])[0];


      const trends: FinancialTrend[] = trendsData.map((row: any) => ({
        year: row.Year,
        month: row.Month,
        monthName: row.MonthName,
        income: row.Income || 0,
        expenses: row.Expenses || 0,
        savings: row.Savings || 0,
        netAmount: row.NetAmount || 0
      }));

      const averages = {
        avgIncome: Math.round(averagesData.AvgIncome || 0),
        avgExpenses: Math.round(averagesData.AvgExpenses || 0),
        avgSavings: Math.round(averagesData.AvgSavings || 0)
      };

      return {
        trends,
        averages
      };
    } catch (error) {
      console.error('Error getting financial trends:', error);
      throw new Error('Failed to fetch financial trends');
    }
  }

  // Get current month budgets
  static async getCurrentBudgets(userId: number, limit: number = 3): Promise<BudgetStatus[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Limit', sql.Int, limit)
        .execute('GetCurrentMonthBudgets');
      
      return result.recordset.map((row: any) => ({
        budgetId: row.Budget_ID,
        categoryName: row.CategoryName,
        budgetAmount: row.BudgetAmount,
        spentAmount: row.SpentAmount,
        remainingAmount: row.RemainingAmount,
        percentageUsed: Math.round(row.PercentageUsed || 0),
        status: row.Status
      }));
    } catch (error) {
      console.error('Error getting current budgets:', error);
      throw new Error('Failed to fetch current budgets');
    }
  }
}