import { connectToDatabase, sql } from '@/lib/database/db';

export interface Jar {
  Jar_ID: number;
  User_ID: number;
  Target_Amount: number;
  Current_Amount: number;
  Level: number;
  Status: 'Active' | 'Completed';
  Created_Date: Date;
  Updated_Date: Date;
  Completion_Date?: Date;
  Action_Taken?: 'Goal_Transfer' | 'Spent' | null;
  Goal_ID?: number;
  Expense_ID?: number;
}

export interface JarResponse {
  Status: 'SUCCESS' | 'ERROR';
  Message: string;
  Jar_ID?: number;
  New_Level?: number;
  Goal_ID?: number;
  Expense_ID?: number;
}

export interface JarHistory {
  Jar_ID: number;
  Level: number;
  Target_Amount: number;
  Completion_Date: Date;
  Action_Taken: 'Goal_Transfer' | 'Spent';
  Goal_Title?: string;
  Expense_Title?: string;
  Amount: number;
}

export class JarService {
  // Get current active jar for student
  static async getCurrentJar(userId: number): Promise<Jar | null> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetCurrentJar');
      
      const row = result.recordset[0];
      if (!row) return null;
      
      return {
        Jar_ID: row.Jar_ID,
        User_ID: row.User_ID,
        Target_Amount: row.Target_Amount,
        Current_Amount: row.Current_Amount,
        Level: row.Level,
        Status: row.Status,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date,
        Completion_Date: row.Completion_Date,
        Action_Taken: row.Action_Taken,
        Goal_ID: row.Goal_ID,
        Expense_ID: row.Expense_ID
      };
    } catch (error) {
      console.error('Error getting current jar:', error);
      throw new Error('Failed to fetch current jar');
    }
  }

  // Add money to current jar
  static async addMoneyToJar(userId: number, amount: number): Promise<JarResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Amount', sql.Decimal(12, 2), amount)
        .execute('AddMoneyToJar');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Jar_ID: response.Jar_ID,
        New_Level: response.New_Level
      };
    } catch (error) {
      console.error('Error adding money to jar:', error);
      throw new Error('Failed to add money to jar');
    }
  }

  // Transfer jar money to goal
  static async transferToGoal(userId: number, jarId: number, goalId: number): Promise<JarResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('JarID', sql.Int, jarId)
        .input('GoalID', sql.Int, goalId)
        .execute('TransferJarToGoal');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Goal_ID: response.Goal_ID,
        New_Level: response.New_Level
      };
    } catch (error) {
      console.error('Error transferring jar to goal:', error);
      throw new Error('Failed to transfer jar money to goal');
    }
  }

  // Mark jar as spent
  static async markJarAsSpent(userId: number, jarId: number, title: string, categoryId: number, description?: string): Promise<JarResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('JarID', sql.Int, jarId)
        .input('Title', sql.NVarChar(100), title)
        .input('CategoryID', sql.Int, categoryId)
        .input('Description', sql.NVarChar(255), description || 'Jar savings spent')
        .execute('MarkJarAsSpent');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Expense_ID: response.Expense_ID,
        New_Level: response.New_Level
      };
    } catch (error) {
      console.error('Error marking jar as spent:', error);
      throw new Error('Failed to mark jar as spent');
    }
  }

  // Get jar history (completed jars)
  static async getJarHistory(userId: number): Promise<JarHistory[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetJarHistory');
      
      return result.recordset.map((row: any) => ({
        Jar_ID: row.Jar_ID,
        Level: row.Level,
        Target_Amount: row.Target_Amount,
        Completion_Date: row.Completion_Date,
        Action_Taken: row.Action_Taken,
        Goal_Title: row.Goal_Title,
        Expense_Title: row.Expense_Title,
        Amount: row.Amount
      }));
    } catch (error) {
      console.error('Error getting jar history:', error);
      throw new Error('Failed to fetch jar history');
    }
  }

  // Get jar statistics
  static async getJarStats(userId: number): Promise<{
    totalJarsCompleted: number;
    totalAmountSaved: number;
    currentLevel: number;
    currentProgress: number;
  }> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetJarStats');
      
      const stats = result.recordset[0];
      return {
        totalJarsCompleted: stats.Total_Jars_Completed || 0,
        totalAmountSaved: stats.Total_Amount_Saved || 0,
        currentLevel: stats.Current_Level || 1,
        currentProgress: stats.Current_Progress || 0
      };
    } catch (error) {
      console.error('Error getting jar stats:', error);
      throw new Error('Failed to fetch jar statistics');
    }
  }

  // Check if user is a student (jar feature only for students)
  static async isUserStudent(userId: number): Promise<boolean> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query('SELECT Type FROM [User] WHERE User_ID = @UserID');
      
      const user = result.recordset[0];
      return user && user.Type === 'Student';
    } catch (error) {
      console.error('Error checking user type:', error);
      throw new Error('Failed to verify user type');
    }
  }
}
