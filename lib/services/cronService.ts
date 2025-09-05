// import cron from 'node-cron';
// import { connectToDatabase } from '@/lib/database/db';
// import { PaymentReminderService } from './paymentReminderService';
// import { EmailService } from './emailService';
// import { LeaderboardService } from './leaderboardService';

// export class CronService {
//   private static instance: CronService;
//   private isRunning: boolean = false;
//   private lastRun: Date | null = null;

//   private paymentReminderService: PaymentReminderService;
//   private emailService: EmailService;

//   private constructor() {
//     this.paymentReminderService = new PaymentReminderService();
//     this.emailService = new EmailService();
//     this.startJobs();
//   }

//   public static getInstance(): CronService {
//     if (!CronService.instance) {
//       CronService.instance = new CronService();
//     }
//     return CronService.instance;
//   }

//   private startJobs() {
//     if (this.isRunning) {
//       console.log('Cron jobs are already running');
//       return;
//     }

//     //  Birthday notifications - run every hour
//     cron.schedule('0 * * * *', async () => {
//       console.log('Running hourly birthday check...');
//       await this.runBirthdayCheck();
//     });

//     //  Payment reminders - run daily at 9AM
//     cron.schedule('0 9 * * *', async () => {
//       console.log('Running daily 9AM payment reminder check...');
//       await this.checkAndSendPaymentReminders();
//     });

//     //  Payment reminders - also run every 6 hours
//     cron.schedule('0 */6 * * *', async () => {
//       console.log('Running 6-hourly payment reminder check...');
//       await this.checkAndSendPaymentReminders();
//     });

//     cron.schedule('0 * * * *', async () => {
//       console.log('Running hourly leaderboard update...');
//       await this.updateLeaderboard();
//     });

//     // NEW: Leaderboard updates - also run daily at midnight
//     cron.schedule('0 0 * * *', async () => {
//       console.log('Running daily midnight leaderboard update...');
//       await this.updateLeaderboard();
//     });


//     this.isRunning = true;
//     console.log('Cron service started successfully');
//   }

//   public stop() {
//     this.isRunning = false;
//     console.log('Cron service stopped (scheduled jobs will not execute)');
//   }

//   public getStatus() {
//     return {
//       isRunning: this.isRunning,
//       lastRun: this.lastRun?.toISOString() || null,
//       service: 'CronService',
//       jobs: {
//         birthdayCheck: 'Every hour',
//         paymentReminders: 'Daily at 9AM and every 6 hours',
//         leaderboardUpdate: 'Every hour and daily at midnight'
//       }
//     };
//   }

//   // ------------------  Birthday Check ------------------
//   public async runBirthdayCheck(): Promise<any> {
//     this.lastRun = new Date();

//     try {
//       console.log('Starting birthday check at:', this.lastRun.toISOString());

//       const pool = await connectToDatabase();

//       // Update ages
//       const ageUpdateRequest = pool.request();
//       const ageUpdateResult = await ageUpdateRequest.execute('sp_UpdateUserAges');

//       // Send birthday notifications
//       const notificationRequest = pool.request();
//       const notificationResult = await notificationRequest.execute('sp_SendBirthdayNotifications');

//       const notifiedUsers = notificationResult.recordset;

//       return {
//         success: true,
//         timestamp: this.lastRun.toISOString(),
//         agesUpdated: ageUpdateResult.recordset[0]?.UpdatedRows || 0,
//         notificationsSent: notifiedUsers.length,
//         notifiedUsers: notifiedUsers.map((user: any) => ({
//           userId: user.User_ID,
//           username: user.Username,
//           newAge: user.NewAge,
//         })),
//       };
//     } catch (error) {
//       console.error('Error in birthday check:', error);
//       throw error;
//     }
//   }

//   // ------------------  Payment Reminders ------------------
//   public async checkAndSendPaymentReminders() {
//     try {
//       console.log('Checking for due payment reminders...');
//       const dueReminders = await this.paymentReminderService.getDuePaymentReminders();

//       if (dueReminders.length === 0) {
//         console.log('No due payment reminders found');
//         return [];
//       }

//       console.log(`Found ${dueReminders.length} due payment reminders`);

//       const processed: any[] = [];

//       for (const reminder of dueReminders) {
//         try {
//           await this.processDueReminder(reminder);
//           processed.push(reminder);
//         } catch (error) {
//           console.error(`Error processing reminder ${reminder.Reminder_ID}:`, error);
//         }
//       }

//       console.log(`Payment reminder check completed. Processed: ${processed.length}`);
//       return processed;
//     } catch (error) {
//       console.error('Error in payment reminder cron job:', error);
//       return [];
//     }
//   }

//   private async processDueReminder(reminder: any) {
//     try {
//       const daysUntilDue = reminder.DaysUntilDue;
//       let message: string;

//       if (daysUntilDue === 0) {
//         message = `Your payment "${reminder.Title}" is due today! Amount: $${reminder.Amount}`;
//       } else if (daysUntilDue > 0) {
//         message = `Your payment "${reminder.Title}" is due in ${daysUntilDue} day(s). Amount: $${reminder.Amount}`;
//       } else {
//         message = `Your payment "${reminder.Title}" is overdue by ${Math.abs(daysUntilDue)} day(s)! Amount: $${reminder.Amount}`;
//       }

//       await this.paymentReminderService.createPaymentReminderNotification(
//         reminder.Reminder_ID,
//         reminder.User_ID,
//         `Payment Reminder: ${reminder.Title}`,
//         message,
//         reminder.Next_Due_Date,
//         reminder.Amount
//       );

//       if (reminder.Email) {
//         await this.emailService.sendPaymentReminderEmail(
//           reminder.Email,
//           reminder.Username,
//           {
//             title: reminder.Title,
//             amount: reminder.Amount,
//             category: reminder.Category ?? "General",
//             dueDate: reminder.Next_Due_Date,
//             daysUntilDue: daysUntilDue
//           }
//         );  
//       }

//       console.log(`Payment reminder notification sent for user ${reminder.User_ID}, reminder ${reminder.Reminder_ID}`);
//     } catch (error) {
//       console.error(`Error processing due reminder ${reminder.Reminder_ID}:`, error);
//       throw error;
//     }
//   }
//    // ------------------  Leaderbord Updates ------------------

//   public async updateLeaderboard(): Promise<any> {
//     this.lastRun = new Date();

//     try {
//       console.log('Starting leaderboard update at:', this.lastRun.toISOString());

//       const result = await LeaderboardService.updateLeaderboard();

//       if (result.Status === 'SUCCESS') {
//         console.log('Leaderboard update completed successfully:', result.Message);
//         return {
//           success: true,
//           timestamp: this.lastRun.toISOString(),
//           message: result.Message,
//           service: 'LeaderboardUpdate'
//         };
//       } else {
//         console.error('Leaderboard update failed:', result.Message);
//         return {
//           success: false,
//           timestamp: this.lastRun.toISOString(),
//           error: result.Message,
//           service: 'LeaderboardUpdate'
//         };
//       }

//     } catch (error) {
//       console.error('Error in leaderboard update:', error);
//       return {
//         success: false,
//         timestamp: this.lastRun.toISOString(),
//         error: error instanceof Error ? error.message : 'Unknown error',
//         service: 'LeaderboardUpdate'
//       };
//     }
//   }
// }

// // Export singleton
// export const getCronService = () => CronService.getInstance();

import cron from 'node-cron';
import { connectToDatabase } from '@/lib/database/db';
import { PaymentReminderService } from './paymentReminderService';
import { EmailService } from './emailService';
import { LeaderboardService } from './leaderboardService';
import { ProfileService } from './profileService';

export class CronService {
  private static instance: CronService;
  private isRunning: boolean = false;
  private lastRun: Date | null = null;

  private paymentReminderService: PaymentReminderService;
  private emailService: EmailService;
  private profileService: ProfileService;

  private constructor() {
    this.paymentReminderService = new PaymentReminderService();
    this.profileService = new ProfileService();
    this.emailService = new EmailService();
    this.startJobs();
  }

  public static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  private startJobs() {
    if (this.isRunning) {
      console.log('Cron jobs are already running');
      return;
    }

    // Birthday notifications - run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly birthday check...');
      await this.runBirthdayCheck();
    });

    // Payment reminders - run daily at 9AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily 9AM payment reminder check...');
      await this.checkAndSendPaymentReminders();
    });

    // Payment reminders - also run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running 6-hourly payment reminder check...');
      await this.checkAndSendPaymentReminders();
    });

    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly leaderboard update...');
      await this.updateLeaderboard();
    });

    // Leaderboard updates - also run daily at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Running daily midnight leaderboard update...');
      await this.updateLeaderboard();
    });

    this.isRunning = true;
    console.log('Cron service started successfully');
  }

  public stop() {
    this.isRunning = false;
    console.log('Cron service stopped (scheduled jobs will not execute)');
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun?.toISOString() || null,
      service: 'CronService',
      jobs: {
        birthdayCheck: 'Every hour',
        paymentReminders: 'Daily at 9AM and every 6 hours',
        leaderboardUpdate: 'Every hour and daily at midnight'
      }
    };
  }

  // ------------------  Birthday Check with Email ------------------
  public async runBirthdayCheck(): Promise<any> {
    this.lastRun = new Date();

    try {
      console.log('Starting birthday check at:', this.lastRun.toISOString());

      const pool = await connectToDatabase();

      // Update ages
      const ageUpdateRequest = pool.request();
      const ageUpdateResult = await ageUpdateRequest.execute('sp_UpdateUserAges');

      // Send birthday notifications
      const notificationRequest = pool.request();
      const notificationResult = await notificationRequest.execute('sp_SendBirthdayNotifications');

      const notifiedUsers = notificationResult.recordset;

      // Send birthday emails to notified users
      for (const user of notifiedUsers) {
        try {
          // Get user email from database
          const userEmailRequest = pool.request();
          userEmailRequest.input('UserId', user.User_ID);
          const userResult = await userEmailRequest.query(`
            SELECT Email FROM Users WHERE User_ID = @UserId
          `);

          const userEmail = userResult.recordset[0]?.Email;

          if (userEmail) {
            await this.emailService.sendBirthdayNotificationEmail(
              userEmail,
              user.Username
            );
            console.log(`📧 Birthday email sent to ${userEmail} for user ${user.Username}`);
          } else {
            console.log(`⚠️ No email found for user ${user.Username}`);
          }
        } catch (emailError) {
          console.error(`❌ Error sending birthday email to user ${user.Username}:`, emailError);
          // Continue with other users even if one email fails
        }
      }

      return {
        success: true,
        timestamp: this.lastRun.toISOString(),
        agesUpdated: ageUpdateResult.recordset[0]?.UpdatedRows || 0,
        notificationsSent: notifiedUsers.length,
        emailsSent: notifiedUsers.length,
        notifiedUsers: notifiedUsers.map((user: any) => ({
          userId: user.User_ID,
          username: user.Username,
          newAge: user.NewAge,
        })),
      };
    } catch (error) {
      console.error('Error in birthday check:', error);
      throw error;
    }
  }

  // ------------------  Payment Reminders (unchanged) ------------------
  public async checkAndSendPaymentReminders() {
    try {
      console.log('Checking for due payment reminders...');
      const dueReminders = await this.paymentReminderService.getDuePaymentReminders();

      if (dueReminders.length === 0) {
        console.log('No due payment reminders found');
        return [];
      }

      console.log(`Found ${dueReminders.length} due payment reminders`);

      const processed: any[] = [];

      for (const reminder of dueReminders) {
        try {
          await this.processDueReminder(reminder);
          processed.push(reminder);
        } catch (error) {
          console.error(`Error processing reminder ${reminder.Reminder_ID}:`, error);
        }
      }

      console.log(`Payment reminder check completed. Processed: ${processed.length}`);
      return processed;
    } catch (error) {
      console.error('Error in payment reminder cron job:', error);
      return [];
    }
  }

  private async processDueReminder(reminder: any) {
    try {
      const daysUntilDue = reminder.DaysUntilDue;
      let message: string;

      if (daysUntilDue === 0) {
        message = `Your payment "${reminder.Title}" is due today! Amount: $${reminder.Amount}`;
      } else if (daysUntilDue > 0) {
        message = `Your payment "${reminder.Title}" is due in ${daysUntilDue} day(s). Amount: $${reminder.Amount}`;
      } else {
        message = `Your payment "${reminder.Title}" is overdue by ${Math.abs(daysUntilDue)} day(s)! Amount: $${reminder.Amount}`;
      }

      // Create notification in database
      await this.paymentReminderService.createPaymentReminderNotification(
        reminder.Reminder_ID,
        reminder.User_ID,
        `Payment Reminder: ${reminder.Title}`,
        message,
        reminder.Next_Due_Date,
        reminder.Amount
      );

      // Send email if user has email
      if (reminder.Email) {
        await this.emailService.sendPaymentReminderEmail(
          reminder.Email,
          reminder.Username,
          {
            title: reminder.Title,
            amount: reminder.Amount,
            category: reminder.Category ?? "General",
            dueDate: reminder.Next_Due_Date,
            daysUntilDue: daysUntilDue
          }
        );
        console.log(`📧 Payment reminder email sent to ${reminder.Email} for ${reminder.Title}`);
      } else {
        console.log(`⚠️ No email found for user ${reminder.Username}`);
      }

      console.log(`Payment reminder notification sent for user ${reminder.User_ID}, reminder ${reminder.Reminder_ID}`);
    } catch (error) {
      console.error(`Error processing due reminder ${reminder.Reminder_ID}:`, error);
      throw error;
    }
  }

  // ------------------  Leaderboard Updates (unchanged) ------------------
  public async updateLeaderboard(): Promise<any> {
    this.lastRun = new Date();

    try {
      console.log('Starting leaderboard update at:', this.lastRun.toISOString());

      const result = await LeaderboardService.updateLeaderboard();

      if (result.Status === 'SUCCESS') {
        console.log('Leaderboard update completed successfully:', result.Message);
        return {
          success: true,
          timestamp: this.lastRun.toISOString(),
          message: result.Message,
          service: 'LeaderboardUpdate'
        };
      } else {
        console.error('Leaderboard update failed:', result.Message);
        return {
          success: false,
          timestamp: this.lastRun.toISOString(),
          error: result.Message,
          service: 'LeaderboardUpdate'
        };
      }

    } catch (error) {
      console.error('Error in leaderboard update:', error);
      return {
        success: false,
        timestamp: this.lastRun.toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'LeaderboardUpdate'
      };
    }
  }
}

// Export singleton
export const getCronService = () => CronService.getInstance();