// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/database/db';

// export async function POST(request: NextRequest) {
//   try {
//     const pool = await connectToDatabase();
    
//     // First update all user ages
//     const ageUpdateRequest = pool.request();
//     const ageUpdateResult = await ageUpdateRequest.execute('sp_UpdateUserAges');
    
//     // Then send birthday notifications
//     const notificationRequest = pool.request();
//     const notificationResult = await notificationRequest.execute('sp_SendBirthdayNotifications');
    
//     const notifiedUsers = notificationResult.recordset;
    
//     return NextResponse.json({
//       success: true,
//       message: 'Birthday check completed successfully',
//       agesUpdated: ageUpdateResult.recordset[0]?.UpdatedRows || 0,
//       notificationsSent: notifiedUsers.length,
//       notifiedUsers: notifiedUsers.map(user => ({
//         userId: user.User_ID,
//         username: user.Username,
//         newAge: user.NewAge
//       }))
//     });

//   } catch (error: any) {
//     console.error('Error in birthday check cron job:', error);
//     return NextResponse.json(
//       { error: error.message || 'Failed to run birthday check' },
//       { status: 500 }
//     );
//   }
// }

// // Manual trigger endpoint
// export async function GET(request: NextRequest) {
//   return POST(request); // Allow manual triggering via GET for testing
// }


import { NextRequest, NextResponse } from 'next/server';
import { getCronService } from '@/lib/services/cronService';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const checkType = url.searchParams.get('type'); // 'birthday', 'payment', 'leaderboard', or null for all
    
    console.log(`Starting manual notification check. Type: ${checkType || 'all'}`);
    
    const cronService = getCronService();
    
    const results: any = {
      success: true,
      message: 'Manual notification checks completed successfully',
      timestamp: new Date().toISOString(),
      results: {}
    };

    // Run Birthday Notifications Check
    if (!checkType || checkType === 'birthday') {
      try {
        console.log('Starting birthday notification check...');
        
        const birthdayResult = await cronService.runBirthdayCheck();
        
        results.results.birthday = {
          success: true,
          agesUpdated: birthdayResult.agesUpdated,
          notificationsSent: birthdayResult.notificationsSent,
          notifiedUsers: birthdayResult.notifiedUsers
        };
        
        console.log(`Birthday check completed: ${birthdayResult.notificationsSent} notifications sent`);
        
      } catch (error: any) {
        console.error('Error in birthday notification check:', error);
        results.results.birthday = {
          success: false,
          error: error.message || 'Failed to run birthday check'
        };
      }
    }

    // Run Payment Reminder Check
    if (!checkType || checkType === 'payment') {
      try {
        console.log('Starting payment reminder check...');
        
        const paymentResult = await cronService.checkAndSendPaymentReminders();
        
        results.results.payment = {
          success: true,
          remindersSent: paymentResult?.length || 0,
          reminders: paymentResult || []
        };
        
        console.log(`Payment reminder check completed: ${paymentResult?.length || 0} reminders sent`);
        
      } catch (error: any) {
        console.error('Error in payment reminder check:', error);
        results.results.payment = {
          success: false,
          error: error.message || 'Failed to run payment reminder check'
        };
      }
    }

    // Run Leaderboard Update Check
    if (!checkType || checkType === 'leaderboard') {
      try {
        console.log('Starting leaderboard update...');
        
        const leaderboardResult = await cronService.updateLeaderboard();
        
        results.results.leaderboard = {
          success: leaderboardResult.success,
          message: leaderboardResult.message || leaderboardResult.error,
          timestamp: leaderboardResult.timestamp
        };
        
        console.log(`Leaderboard update completed: ${leaderboardResult.success ? 'Success' : 'Failed'}`);
        
      } catch (error: any) {
        console.error('Error in leaderboard update:', error);
        results.results.leaderboard = {
          success: false,
          error: error.message || 'Failed to run leaderboard update'
        };
      }
    }

    // Calculate overall success
    const birthdaySuccess = !results.results.birthday || results.results.birthday.success;
    const paymentSuccess = !results.results.payment || results.results.payment.success;
    const leaderboardSuccess = !results.results.leaderboard || results.results.leaderboard.success;
    
    results.success = birthdaySuccess && paymentSuccess && leaderboardSuccess;

    // Generate summary message
    const summaryParts = [];
    if (results.results.birthday) {
      summaryParts.push(`Birthday: ${results.results.birthday.success ? 'Success' : 'Failed'}`);
    }
    if (results.results.payment) {
      summaryParts.push(`Payment: ${results.results.payment.success ? 'Success' : 'Failed'}`);
    }
    if (results.results.leaderboard) {
      summaryParts.push(`Leaderboard: ${results.results.leaderboard.success ? 'Success' : 'Failed'}`);
    }
    
    results.message = `Manual checks completed. ${summaryParts.join(', ')}`;

    // Backward compatibility: if only checking birthdays, return old format
    if (checkType === 'birthday' && results.results.birthday?.success) {
      return NextResponse.json({
        success: true,
        message: 'Birthday check completed successfully',
        agesUpdated: results.results.birthday.agesUpdated,
        notificationsSent: results.results.birthday.notificationsSent,
        notifiedUsers: results.results.birthday.notifiedUsers
      });
    }

    // Backward compatibility: if only checking payments, return simplified format
    if (checkType === 'payment' && results.results.payment?.success) {
      return NextResponse.json({
        success: true,
        message: 'Payment reminder check completed successfully',
        remindersSent: results.results.payment.remindersSent,
        reminders: results.results.payment.reminders
      });
    }

    // Log final results
    console.log('Manual cron job completed:', {
      overall: results.success ? 'SUCCESS' : 'PARTIAL_FAILURE',
      birthday: results.results.birthday,
      payment: results.results.payment,
      leaderboard: results.results.leaderboard
    });

    return NextResponse.json(results, { 
      status: results.success ? 200 : 207 // 207 Multi-Status for partial failures
    });

  } catch (error: any) {
    console.error('Critical error in manual cron job:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Critical error in manual cron job',
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint - supports query parameters for selective checking
export async function GET(request: NextRequest) {
  console.log('Manual trigger via GET request');
  return POST(request);
}
