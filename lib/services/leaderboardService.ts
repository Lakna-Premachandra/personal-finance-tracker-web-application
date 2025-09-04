import { connectToDatabase, sql } from '@/lib/database/db';

export interface LeaderboardUser {
  User_ID: number;
  Username: string;
  User_Type: 'Student' | 'Young Adult';
  Rank: number;
  Goals_Completed: number;
  Total_Goals: number;
  Goal_Completion_Rate: number;
  Jar_Level: number;
  Score: number;
  Badge_Title?: string;
  Created_Date: Date;
  Updated_Date: Date;
}

export interface LeaderboardEligibility {
  User_ID: number;
  Username: string;
  Is_Eligible: boolean;
  Goals_Completed: number;
  Goals_Required: number;
  Jar_Level: number;
  Jar_Level_Required: number;
  Progress_Message: string;
}

export interface LeaderboardStats {
  Total_Students: number;
  Eligible_Students: number;
  Your_Rank?: number;
  Top_Score: number;
  Average_Score: number;
}

export interface LeaderboardResponse {
  Status: 'SUCCESS' | 'ERROR';
  Message: string;
}

export class LeaderboardService {
  
  // Get leaderboard for students only
  static async getLeaderboard(userId?: number): Promise<LeaderboardUser[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId || null)
        .execute('GetStudentLeaderboard');
      
      return result.recordset.map((row: any) => ({
        User_ID: row.User_ID,
        Username: row.Username,
        ProfilePicture: row.ProfilePicture,
        User_Type: row.User_Type,
        Rank: row.Rank,
        Goals_Completed: row.Goals_Completed,
        Total_Goals: row.Total_Goals,
        Goal_Completion_Rate: row.Goal_Completion_Rate,
        Jar_Level: row.Jar_Level,
        Score: row.Score,
        Badge_Title: row.Badge_Title,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }
  }

  // Check user eligibility for leaderboard
  static async checkEligibility(userId: number): Promise<LeaderboardEligibility> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('CheckLeaderboardEligibility');
      
      const row = result.recordset[0];
      return {
        User_ID: row.User_ID,
        Username: row.Username,
        Is_Eligible: row.Is_Eligible,
        Goals_Completed: row.Goals_Completed,
        Goals_Required: row.Goals_Required,
        Jar_Level: row.Jar_Level,
        Jar_Level_Required: row.Jar_Level_Required,
        Progress_Message: row.Progress_Message
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw new Error('Failed to check leaderboard eligibility');
    }
  }

  // Get leaderboard statistics
  static async getLeaderboardStats(userId?: number): Promise<LeaderboardStats> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId || null)
        .execute('GetLeaderboardStats');
      
      const row = result.recordset[0];
      return {
        Total_Students: row.Total_Students,
        Eligible_Students: row.Eligible_Students,
        Your_Rank: row.Your_Rank,
        Top_Score: row.Top_Score,
        Average_Score: row.Average_Score
      };
    } catch (error) {
      console.error('Error getting leaderboard stats:', error);
      throw new Error('Failed to fetch leaderboard statistics');
    }
  }

  // Update/refresh leaderboard rankings
  static async updateLeaderboard(): Promise<LeaderboardResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .execute('UpdateLeaderboardRankings');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw new Error('Failed to update leaderboard');
    }
  }

  // Get user's leaderboard position
  static async getUserPosition(userId: number): Promise<LeaderboardUser | null> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetUserLeaderboardPosition');
      
      const row = result.recordset[0];
      if (!row) return null;

      return {
        User_ID: row.User_ID,
        Username: row.Username,
        User_Type: row.User_Type,
        Rank: row.Rank,
        Goals_Completed: row.Goals_Completed,
        Total_Goals: row.Total_Goals,
        Goal_Completion_Rate: row.Goal_Completion_Rate,
        Jar_Level: row.Jar_Level,
        Score: row.Score,
        Badge_Title: row.Badge_Title,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date
      };
    } catch (error) {
      console.error('Error getting user position:', error);
      throw new Error('Failed to fetch user leaderboard position');
    }
  }
}