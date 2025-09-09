import { connectToDatabase, sql } from '@/lib/database/db';

export interface StudentDashboardSummary {
  totalBalance: number;
  balanceChangePercentage: number;
  monthlyIncome: number;
  incomeChangePercentage: number;
  monthlyExpenses: number;
  expenseChangePercentage: number;
  savingsGoalPercentage: number;
  totalGoalTargetAmount: number;
  totalGoalCurrentAmount: number;
  currentJarLevel: number;
}

export interface Transaction {
  type: 'Income' | 'Expense';
  title: string;
  amount: number;
  createdDate: Date;
  categoryName: string;
}

export interface JarDetails {
  jarId: number;
  targetAmount: number;
  currentAmount: number;
  level: number;
  status: string;
  completionPercentage: number;
  amountToNextLevel: number;
  createdDate: Date;
  updatedDate: Date;
}

export interface JarMilestone {
  level: number;
  targetAmount: number;
  status: string;
  completionDate: Date;
  actionTaken: string;
}

export interface ExpenseBreakdown {
  categoryName: string;
  categoryId: number;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  badgeTitle: string;
  goalsCompleted: number;
  goalCompletionRate: number;
  jarLevel: number;
}

export interface LeaderboardData {
  topUsers: LeaderboardEntry[];
  currentUser?: LeaderboardEntry & { totalParticipants: number };
}

export interface GoalProgress {
  goalId: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  status: string;
  completionPercentage: number;
  daysLeft: number;
  timelineStatus: string;
  dailyTargetAmount: number;
}

export class StudentDashboardService {
  // Get complete dashboard data
  static async getDashboardData(userId: number) {
    try {
      const [
        summary,
        recentTransactions,
        jarDetails,
        expenseBreakdown,
        leaderboard,
        goalProgress
      ] = await Promise.all([
        this.getSummary(userId),
        this.getRecentTransactions(userId),
        this.getJarDetails(userId),
        this.getExpenseBreakdown(userId),
        this.getLeaderboard(userId),
        this.getGoalProgress(userId)
      ]);

      return {
        summary,
        recentTransactions,
        jarDetails,
        expenseBreakdown,
        leaderboard,
        goalProgress
      };
    } catch (error) {
      console.error('Error getting complete student dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  // Get dashboard summary
  static async getSummary(userId: number): Promise<StudentDashboardSummary> {
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
        totalGoalCurrentAmount: row.TotalGoalCurrentAmount || 0,
        currentJarLevel: row.CurrentJarLevel || 0
      };
    } catch (error) {
      console.error('Error getting student dashboard summary:', error);
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

  // Get jar details
  static async getJarDetails(userId: number): Promise<{
    currentJar: JarDetails | null;
    milestones: JarMilestone[];
  }> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetJarDetails');

      const recordsets = result.recordsets as unknown as any[][]; // Cast to array of arrays
      const currentJarData = recordsets[0]?.[0];
      const milestonesData = recordsets[1] || [];


      const currentJar: JarDetails | null = currentJarData ? {
        jarId: currentJarData.Jar_ID,
        targetAmount: currentJarData.Target_Amount,
        currentAmount: currentJarData.Current_Amount,
        level: currentJarData.Level,
        status: currentJarData.Status,
        completionPercentage: Math.round(currentJarData.CompletionPercentage || 0),
        amountToNextLevel: currentJarData.AmountToNextLevel,
        createdDate: currentJarData.Created_Date,
        updatedDate: currentJarData.Updated_Date
      } : null;

      const milestones: JarMilestone[] = milestonesData.map((row: any) => ({
        level: row.Level,
        targetAmount: row.Target_Amount,
        status: row.Status,
        completionDate: row.Completion_Date,
        actionTaken: row.Action_Taken
      }));

      return {
        currentJar,
        milestones
      };
    } catch (error) {
      console.error('Error getting jar details:', error);
      throw new Error('Failed to fetch jar details');
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

  // Get leaderboard
  static async getLeaderboard(userId: number): Promise<LeaderboardData> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Limit', sql.Int, 3)
        .execute('GetLeaderboard');
      
      const recordsets = result.recordsets as unknown as any[][];
      const topUsersData = recordsets[0] || [];
      const currentUserData = recordsets[1]?.[0];

      const topUsers: LeaderboardEntry[] = topUsersData.map((row: any) => ({
        rank: row.Rank,
        username: row.Username,
        score: row.Score,
        badgeTitle: row.Badge_Title,
        goalsCompleted: row.Goals_Completed,
        goalCompletionRate: row.Goal_Completion_Rate,
        jarLevel: row.Jar_Level
      }));

      const currentUser = currentUserData ? {
        rank: currentUserData.Rank,
        username: currentUserData.Username,
        score: currentUserData.Score,
        badgeTitle: currentUserData.Badge_Title,
        goalsCompleted: currentUserData.Goals_Completed,
        goalCompletionRate: currentUserData.Goal_Completion_Rate,
        jarLevel: currentUserData.Jar_Level,
        totalParticipants: currentUserData.TotalParticipants
      } : undefined;

      return {
        topUsers,
        currentUser
      };
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }
  }

  // Get goal progress
  static async getGoalProgress(userId: number): Promise<GoalProgress[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetGoalProgress');
      
      return result.recordset.map((row: any) => ({
        goalId: row.Goal_ID,
        title: row.Title,
        targetAmount: row.Target_Amount,
        currentAmount: row.Current_Amount,
        targetDate: row.Target_Date,
        status: row.Status,
        completionPercentage: Math.round(row.CompletionPercentage || 0),
        daysLeft: row.DaysLeft,
        timelineStatus: row.TimelineStatus,
        dailyTargetAmount: row.DailyTargetAmount
      }));
    } catch (error) {
      console.error('Error getting goal progress:', error);
      throw new Error('Failed to fetch goal progress');
    }
  }
}