import { connectToDatabase, sql } from '@/lib/database/db';

export class NotificationService {
  async getUserNotifications(userId: number) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      const result = await request.execute('sp_GetUserNotifications');
      
      return {
        success: true,
        notifications: result.recordset,
        hasUnprocessed: result.recordset.length > 0
      };

    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsProcessed(userId: number, notificationId: number) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      request.input('Notification_ID', sql.Int, notificationId);
      
      await request.query(`
        UPDATE Birthday_Notifications 
        SET Is_Processed = 1 
        WHERE Notification_ID = @Notification_ID AND User_ID = @User_ID
      `);

      return { success: true };

    } catch (error) {
      console.error('Error marking notification as processed:', error);
      throw error;
    }
  }

  async createBirthdayNotification(userId: number) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      await request.execute('sp_MarkBirthdayNotificationSent');

      return { success: true };

    } catch (error) {
      console.error('Error creating birthday notification:', error);
      throw error;
    }
  }
}
