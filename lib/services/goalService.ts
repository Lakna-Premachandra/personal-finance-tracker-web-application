import { connectToDatabase, sql } from '@/lib/database/db';

export interface Goal {
  Goal_ID: number;
  User_ID: number;
  Title: string;
  Description: string;
  Target_Amount: number;
  Current_Amount: number;
  Start_Date: Date;
  Target_Date: Date;
  Category_Name?: string; 
  Category_ID: number;
  Status: 'Active' | 'Completed' | 'Overdue' | 'Achieved';
  Created_Date: Date;
  Updated_Date: Date;
  Days_Left: number;
  Remaining_Amount: number;
  Completion_Percentage: number;
  Daily_Saving_Required: number;

  
}

export interface GoalInput {
  title: string;
  description?: string;
  targetAmount: number;
  targetDate: Date | string;
  categoryId: number;
  startDate?: Date | string;
}
export interface GoalSummary {
  activeGoals: number;
  completedGoals: number;
  totalSaved: number;
  totalTargetAmount: number;
}

export interface GoalsResponse {
  summary: GoalSummary;
  goals: Goal[];
}

export interface GoalResponse {
  Status: 'SUCCESS' | 'ERROR';
  Message: string;
  Goal_ID?: number;
}

export interface ContributeToGoalInput {
  goalId: number;
  amount: number;
}

export interface CategoryOption {
  Category_ID: number;
  Name: string;
  Type: 'Expense';
  Is_Default: boolean;
}

export interface MarkAsSpentResponse {
  Status: 'SUCCESS' | 'ERROR';
  Message: string;
  Expense_ID?: number;
}

export class GoalService {
  // Helper method to parse date
  private static parseDate(dateInput: Date | string): Date {
    if (typeof dateInput === 'string') {
      return new Date(dateInput);
    }
    return dateInput;
  }

  // Add a new goal
  static async addGoal(userId: number, goalInput: GoalInput): Promise<GoalResponse> {
    try {
      const pool = await connectToDatabase();
      const request = pool.request()
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), goalInput.title)
        .input('Description', sql.VarChar(500), goalInput.description || '')
        .input('TargetAmount', sql.Decimal(12, 2), goalInput.targetAmount)
        .input('TargetDate', sql.Date, this.parseDate(goalInput.targetDate))
        .input('CategoryID', sql.Int, goalInput.categoryId);

      if (goalInput.startDate) {
        request.input('StartDate', sql.Date, this.parseDate(goalInput.startDate));
      }

      const result = await request.execute('AddGoal');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Goal_ID: response.Goal_ID
      };
    } catch (error) {
      console.error('Error adding goal:', error);
      throw new Error('Failed to add goal');
    }
  }

  // Get all goals for a user
  // static async getAllGoals(userId: number): Promise<Goal[]> {
  //   try {
  //     const pool = await connectToDatabase();
  //     const result = await pool.request()
  //       .input('UserID', sql.Int, userId)
  //       .execute('GetAllGoals');
      
  //     return result.recordset.map((row: any) => ({
  //       Goal_ID: row.Goal_ID,
  //       User_ID: row.User_ID,
  //       Title: row.Title,
  //       Description: row.Description,
  //       Target_Amount: parseFloat(row.Target_Amount),
  //       Current_Amount: parseFloat(row.Current_Amount),
  //       Start_Date: row.Start_Date,
  //       Target_Date: row.Target_Date,
  //       Category_ID: row.Category_ID,
  //       Category_Name: row.Category_Name,
  //       Status: row.Status,
  //       Created_Date: row.Created_Date,
  //       Updated_Date: row.Updated_Date,
  //       Days_Left: row.Days_Left,
  //       Remaining_Amount: parseFloat(row.Remaining_Amount),
  //       Completion_Percentage: parseFloat(row.Completion_Percentage),
  //       Daily_Saving_Required: parseFloat(row.Daily_Saving_Required)
  //     }));
  //   } catch (error) {
  //     console.error('Error getting all goals:', error);
  //     throw new Error('Failed to fetch goals');
  //   }
  // }
 static async getAllGoals(userId: number): Promise<GoalsResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetAllGoals');

      // Fix TypeScript errors by properly typing and checking recordsets
      const recordsets = result.recordsets;
      
      // Ensure recordsets is an array and has the expected structure
      if (!Array.isArray(recordsets) || recordsets.length < 2) {
        throw new Error('Invalid stored procedure response format');
      }

      // First result set contains summary data
      const summaryRecordset = recordsets[0];
      const summaryData = summaryRecordset && summaryRecordset.length > 0 ? summaryRecordset[0] : null;

      // Second result set contains goals data
      const goalsRecordset = recordsets[1];
      const goalsData = goalsRecordset || [];

      return {
        summary: {
          activeGoals: summaryData?.ActiveGoals || 0,
          completedGoals: summaryData?.CompletedGoals || 0,
          totalSaved: parseFloat(summaryData?.TotalSaved) || 0,
          totalTargetAmount: parseFloat(summaryData?.TotalTargetAmount) || 0
        },
        goals: goalsData.map((row: any) => ({
          Goal_ID: row.Goal_ID,
          User_ID: row.User_ID,
          Title: row.Title,
          Description: row.Description,
          Target_Amount: parseFloat(row.Target_Amount),
          Current_Amount: parseFloat(row.Current_Amount),
          Start_Date: row.Start_Date,
          Target_Date: row.Target_Date,
          Category_ID: row.Category_ID,
          Category_Name: row.Category_Name,
          Status: row.Status,
          Created_Date: row.Created_Date,
          Updated_Date: row.Updated_Date,
          Days_Left: row.Days_Left,
          Remaining_Amount: parseFloat(row.Remaining_Amount),
          Completion_Percentage: parseFloat(row.Completion_Percentage),
          Daily_Saving_Required: parseFloat(row.Daily_Saving_Required)
        }))
      };
    } catch (error) {
      console.error('Error getting all goals:', error);
      throw error;
    }
  }

  // Get goal by ID
  static async getGoalById(goalId: number, userId: number): Promise<Goal | null> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('GoalID', sql.Int, goalId)
        .input('UserID', sql.Int, userId)
        .execute('GetGoalById');
      
      if (result.recordset.length === 0) {
        return null;
      }

      const row = result.recordset[0];
      return {
        Goal_ID: row.Goal_ID,
        User_ID: row.User_ID,
        Title: row.Title,
        Description: row.Description,
        Target_Amount: parseFloat(row.Target_Amount),
        Current_Amount: parseFloat(row.Current_Amount),
        Start_Date: row.Start_Date,
        Target_Date: row.Target_Date,
        Category_ID: row.Category_ID,
        Category_Name: row.Category_Name,
        Status: row.Status,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date,
        Days_Left: row.Days_Left,
        Remaining_Amount: parseFloat(row.Remaining_Amount),
        Completion_Percentage: parseFloat(row.Completion_Percentage),
        Daily_Saving_Required: parseFloat(row.Daily_Saving_Required)
      };
    } catch (error) {
      console.error('Error getting goal by ID:', error);
      throw new Error('Failed to fetch goal');
    }
  }

  // Contribute to a goal
  static async contributeToGoal(userId: number, goalId: number, amount: number): Promise<GoalResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('GoalID', sql.Int, goalId)
        .input('UserID', sql.Int, userId)
        .input('Amount', sql.Decimal(12, 2), amount)
        .execute('ContributeToGoal');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error contributing to goal:', error);
      throw new Error('Failed to contribute to goal');
    }
  }

  // Update goal
  static async updateGoal(goalId: number, userId: number, goalInput: GoalInput & { status?: string }): Promise<GoalResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('GoalID', sql.Int, goalId)
        .input('UserID', sql.Int, userId)
        .input('Title', sql.VarChar(100), goalInput.title)
        .input('Description', sql.VarChar(500), goalInput.description || '')
        .input('TargetAmount', sql.Decimal(12, 2), goalInput.targetAmount)
        .input('TargetDate', sql.Date, this.parseDate(goalInput.targetDate))
        .input('CategoryID', sql.Int, goalInput.categoryId)
        .input('Status', sql.VarChar(20), goalInput.status || null)
        .execute('UpdateGoal');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update goal');
    }
  }

  // Delete goal
  static async deleteGoal(goalId: number, userId: number): Promise<GoalResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('GoalID', sql.Int, goalId)
        .input('UserID', sql.Int, userId)
        .execute('DeleteGoal');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw new Error('Failed to delete goal');
    }
  }

  // Mark goal as spent (move to expenses and complete goal)
  static async markGoalAsSpent(goalId: number, userId: number): Promise<MarkAsSpentResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('GoalID', sql.Int, goalId)
        .input('UserID', sql.Int, userId)
        .execute('MarkGoalAsSpent');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Expense_ID: response.Expense_ID
      };
    } catch (error) {
      console.error('Error marking goal as spent:', error);
      throw new Error('Failed to mark goal as spent');
    }
  }
}
