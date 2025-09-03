import { connectToDatabase, sql } from '@/lib/database/db';

export interface PaymentReminderData {
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  remindDaysBefore: number;
  frequency?: string;
  isEnabled?: boolean;
}

export interface PaymentReminderStats {
  activeReminders: number;
  upcomingReminders: number;
  overdueReminders: number;
  totalAmount: number;
}

export class PaymentReminderService {
  
  async createPaymentReminder(userId: number, reminderData: PaymentReminderData) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      request.input('Title', sql.NVarChar(255), reminderData.title);
      request.input('Amount', sql.Decimal(18, 2), reminderData.amount);
      request.input('Category', sql.NVarChar(100), reminderData.category);
      request.input('Due_Date', sql.Date, reminderData.dueDate);
      request.input('Remind_Days_Before', sql.Int, reminderData.remindDaysBefore);
      request.input('Frequency', sql.NVarChar(20), reminderData.frequency || null);
      request.input('Is_Enabled', sql.Bit, reminderData.isEnabled ?? true);
      
      const result = await request.execute('sp_CreatePaymentReminder');
      return result.recordset[0];
      
    } catch (error) {
      console.error('Error creating payment reminder:', error);
      throw error;
    }
  }

  async getUserPaymentReminders(userId: number) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      const result = await request.execute('sp_GetUserPaymentReminders');
      
      return {
        success: true,
        reminders: result.recordset
      };
      
    } catch (error) {
      console.error('Error getting user payment reminders:', error);
      throw error;
    }
  }

  async getPaymentReminderStats(userId: number): Promise<PaymentReminderStats> {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      const result = await request.execute('sp_GetPaymentReminderStats');
      
      const stats = result.recordset[0];
      return {
        activeReminders: stats.ActiveReminders,
        upcomingReminders: stats.UpcomingReminders,
        overdueReminders: stats.OverdueReminders,
        totalAmount: parseFloat(stats.TotalAmount)
      };
      
    } catch (error) {
      console.error('Error getting payment reminder stats:', error);
      throw error;
    }
  }

  async getPaymentReminderById(userId: number, reminderId: number) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      request.input('Reminder_ID', sql.Int, reminderId);
      
      const result = await request.execute('sp_GetPaymentReminderById');
      
      if (result.recordset.length === 0) {
        return { success: false, message: 'Payment reminder not found' };
      }
      
      return {
        success: true,
        reminder: result.recordset[0]
      };
      
    } catch (error) {
      console.error('Error getting payment reminder by ID:', error);
      throw error;
    }
  }

  async updatePaymentReminder(userId: number, reminderId: number, reminderData: PaymentReminderData) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      request.input('Reminder_ID', sql.Int, reminderId);
      request.input('Title', sql.NVarChar(255), reminderData.title);
      request.input('Amount', sql.Decimal(18, 2), reminderData.amount);
      request.input('Category', sql.NVarChar(100), reminderData.category);
      request.input('Due_Date', sql.Date, reminderData.dueDate);
      request.input('Remind_Days_Before', sql.Int, reminderData.remindDaysBefore);
      request.input('Frequency', sql.NVarChar(20), reminderData.frequency || null);
      request.input('Is_Enabled', sql.Bit, reminderData.isEnabled ?? true);
      
      const result = await request.execute('sp_UpdatePaymentReminder');
      return result.recordset[0];
      
    } catch (error) {
      console.error('Error updating payment reminder:', error);
      throw error;
    }
  }

  async deletePaymentReminder(userId: number, reminderId: number) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      request.input('Reminder_ID', sql.Int, reminderId);
      
      const result = await request.execute('sp_DeletePaymentReminder');
      return result.recordset[0];
      
    } catch (error) {
      console.error('Error deleting payment reminder:', error);
      throw error;
    }
  }

  async markPaymentAsPaid(userId: number, reminderId: number, description?: string) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      request.input('Reminder_ID', sql.Int, reminderId);
      request.input('Description', sql.NVarChar(500), description || null);
      
      const result = await request.execute('sp_MarkPaymentAsPaid');
      return result.recordset[0];
      
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw error;
    }
  }

  async getDuePaymentReminders() {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      const result = await request.execute('sp_GetDuePaymentReminders');
      return result.recordset;
      
    } catch (error) {
      console.error('Error getting due payment reminders:', error);
      throw error;
    }
  }

  async createPaymentReminderNotification(
    reminderId: number, 
    userId: number, 
    title: string, 
    message: string, 
    dueDate: string, 
    amount: number
  ) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('Reminder_ID', sql.Int, reminderId);
      request.input('User_ID', sql.Int, userId);
      request.input('Title', sql.NVarChar(255), title);
      request.input('Message', sql.NVarChar(500), message);
      request.input('Due_Date', sql.Date, dueDate);
      request.input('Amount', sql.Decimal(18, 2), amount);
      
      const result = await request.execute('sp_CreatePaymentReminderNotification');
      return result.recordset[0];
      
    } catch (error) {
      console.error('Error creating payment reminder notification:', error);
      throw error;
    }
  }

  async getUserPaymentReminderNotifications(userId: number) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      const result = await request.execute('sp_GetUserPaymentReminderNotifications');
      
      return {
        success: true,
        notifications: result.recordset,
        hasUnprocessed: result.recordset.length > 0
      };
      
    } catch (error) {
      console.error('Error getting user payment reminder notifications:', error);
      throw error;
    }
  }

  async markPaymentReminderNotificationAsProcessed(userId: number, notificationId: number) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      request.input('Notification_ID', sql.Int, notificationId);
      
      const result = await request.execute('sp_MarkPaymentReminderNotificationProcessed');
      return { success: true, rowsAffected: result.recordset[0].RowsAffected };
      
    } catch (error) {
      console.error('Error marking payment reminder notification as processed:', error);
      throw error;
    }
  }
}