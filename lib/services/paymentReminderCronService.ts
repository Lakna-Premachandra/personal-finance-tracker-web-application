import cron from 'node-cron';
import { PaymentReminderService } from './paymentReminderService';
import { EmailService } from './emailService';

export class PaymentReminderCronService {
  private paymentReminderService: PaymentReminderService;
  private emailService: EmailService;
  private isRunning: boolean = false;

  constructor() {
    this.paymentReminderService = new PaymentReminderService();
    this.emailService = new EmailService();
  }

  start() {
    if (this.isRunning) {
      console.log('Payment reminder cron service is already running');
      return;
    }

    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running payment reminder check...');
      await this.checkAndSendPaymentReminders();
    });

    // Also run every 6 hours for more frequent checks
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running 6-hourly payment reminder check...');
      await this.checkAndSendPaymentReminders();
    });

    this.isRunning = true;
    console.log('Payment reminder cron service started');
  }

  stop() {
    this.isRunning = false;
    console.log('Payment reminder cron service stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      service: 'PaymentReminderCronService'
    };
  }

  async checkAndSendPaymentReminders() {
    try {
      console.log('Checking for due payment reminders...');
      
      const dueReminders = await this.paymentReminderService.getDuePaymentReminders();
      
      if (dueReminders.length === 0) {
        console.log('No due payment reminders found');
        return;
      }

      console.log(`Found ${dueReminders.length} due payment reminders`);

      for (const reminder of dueReminders) {
        try {
          await this.processDueReminder(reminder);
        } catch (error) {
          console.error(`Error processing reminder ${reminder.Reminder_ID}:`, error);
        }
      }

      console.log('Payment reminder check completed');
      
    } catch (error) {
      console.error('Error in payment reminder cron job:', error);
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

      // Send email notification
      if (reminder.Email) {
        // await this.emailService.sendPaymentReminderEmail(
        //   reminder.Email,
        //   reminder.Username,
        //   reminder.Title,
        //   reminder.Amount,
        //   reminder.Next_Due_Date,
        //   daysUntilDue
        // );
        await this.emailService.sendPaymentReminderEmail(
          reminder.Email,
          reminder.Username,
          {
            title: reminder.Title,
            amount: reminder.Amount,
            category: reminder.Category ?? "General", // add a fallback if category can be null
            dueDate: reminder.Next_Due_Date,
            daysUntilDue: daysUntilDue
          }
        );  
      }

      console.log(`Payment reminder notification sent for user ${reminder.User_ID}, reminder ${reminder.Reminder_ID}`);
      
    } catch (error) {
      console.error(`Error processing due reminder ${reminder.Reminder_ID}:`, error);
      throw error;
    }
  }
}