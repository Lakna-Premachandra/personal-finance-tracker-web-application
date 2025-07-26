import { connectToDatabase } from '@/lib/database/db';

export class CronService {
  private static instance: CronService;
  private isRunning: boolean = false;
  private lastRun: Date | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    // Start the cron job when service is initialized
    this.startCronJob();
  }

  public static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  private startCronJob() {
    // Run every hour (you can adjust this)
    const intervalMs = 60 * 60 * 1000; // 1 hour
    
    this.intervalId = setInterval(async () => {
      await this.runBirthdayCheck();
    }, intervalMs);

    console.log('Birthday check cron job started');
  }

  public stopCronJob() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Birthday check cron job stopped');
    }
  }

  public async runBirthdayCheck(): Promise<any> {
    if (this.isRunning) {
      console.log('Birthday check already running, skipping...');
      return { message: 'Already running' };
    }

    this.isRunning = true;
    this.lastRun = new Date();

    try {
      console.log('Starting birthday check at:', this.lastRun.toISOString());

      const pool = await connectToDatabase();
      
      // First update all user ages
      const ageUpdateRequest = pool.request();
      const ageUpdateResult = await ageUpdateRequest.execute('sp_UpdateUserAges');
      
      // Then send birthday notifications
      const notificationRequest = pool.request();
      const notificationResult = await notificationRequest.execute('sp_SendBirthdayNotifications');
      
      const notifiedUsers = notificationResult.recordset;
      
      const result = {
        success: true,
        timestamp: this.lastRun.toISOString(),
        agesUpdated: ageUpdateResult.recordset[0]?.UpdatedRows || 0,
        notificationsSent: notifiedUsers.length,
        notifiedUsers: notifiedUsers.map(user => ({
          userId: user.User_ID,
          username: user.Username,
          newAge: user.NewAge
        }))
      };

      console.log('Birthday check completed:', result);
      return result;

    } catch (error) {
      console.error('Error in birthday check:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  public async manualCheck(): Promise<any> {
    console.log('Manual birthday check triggered');
    return await this.runBirthdayCheck();
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun?.toISOString() || null,
      cronJobActive: this.intervalId !== null
    };
  }
}

// Singleton instance getter
export const getCronService = () => CronService.getInstance();
