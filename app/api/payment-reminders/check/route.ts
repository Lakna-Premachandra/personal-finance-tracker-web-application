// import { NextResponse } from 'next/server';
// import { getCronService } from '@/lib/services/cronService';

// export async function POST() {
//   try {
//     const cronService = getCronService();

//     const result = await cronService.checkAndSendPaymentReminders();

//     return NextResponse.json({
//       success: true,
//       message: 'Payment reminder check completed successfully',
//       result: result?.length
//         ? { count: result.length, reminders: result }
//         : 'No reminders found'
//     });
//   } catch (error: any) {
//     console.error('Error running payment reminder check:', error);
//     return NextResponse.json(
//       { error: error.message || 'Failed to run payment reminder check' },
//       { status: 500 }
//     );
//   }
// }

// // Optional GET route for testing (triggers POST)
// export async function GET() {
//   return POST();
// }

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/db';
import { getCronService } from '@/lib/services/cronService';

// POST /api/cron/notifications - Run all notification checks (birthday + payment reminders)
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const checkType = url.searchParams.get('type'); // 'birthday', 'payment', or null for both
    
    console.log(`Starting notification cron job. Type: ${checkType || 'both'}`);
    
    const results: any = {
      success: true,
      message: 'Notification checks completed successfully',
      timestamp: new Date().toISOString(),
      results: {}
    };

    // Run Birthday Notifications Check
    if (!checkType || checkType === 'birthday') {
      try {
        console.log('Starting birthday notification check...');
        
        const pool = await connectToDatabase();
        
        // First update all user ages
        const ageUpdateRequest = pool.request();
        const ageUpdateResult = await ageUpdateRequest.execute('sp_UpdateUserAges');
        
        // Then send birthday notifications
        const notificationRequest = pool.request();
        const notificationResult = await notificationRequest.execute('sp_SendBirthdayNotifications');
        
        const notifiedUsers = notificationResult.recordset;
        
        results.results.birthday = {
          success: true,
          agesUpdated: ageUpdateResult.recordset[0]?.UpdatedRows || 0,
          notificationsSent: notifiedUsers.length,
          notifiedUsers: notifiedUsers.map(user => ({
            userId: user.User_ID,
            username: user.Username,
            newAge: user.NewAge
          }))
        };
        
        console.log(`Birthday check completed: ${notifiedUsers.length} notifications sent`);
        
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
        
        const cronService = getCronService();
        const paymentResult = await cronService.checkAndSendPaymentReminders();
        
        results.results.payment = {
          success: true,
          remindersSent: paymentResult?.length || 0,
          reminders: paymentResult?.length 
            ? paymentResult 
            : []
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

    // Calculate overall success
    const birthdaySuccess = !results.results.birthday || results.results.birthday.success;
    const paymentSuccess = !results.results.payment || results.results.payment.success;
    results.success = birthdaySuccess && paymentSuccess;

    // Generate summary message
    const summaryParts = [];
    if (results.results.birthday) {
      summaryParts.push(`Birthday: ${results.results.birthday.success ? 'Success' : 'Failed'}`);
    }
    if (results.results.payment) {
      summaryParts.push(`Payment: ${results.results.payment.success ? 'Success' : 'Failed'}`);
    }
    results.message = `Notification checks completed. ${summaryParts.join(', ')}`;

    // Log final results
    console.log('Cron job completed:', {
      overall: results.success ? 'SUCCESS' : 'PARTIAL_FAILURE',
      birthday: results.results.birthday,
      payment: results.results.payment
    });

    return NextResponse.json(results, { 
      status: results.success ? 200 : 207 // 207 Multi-Status for partial failures
    });

  } catch (error: any) {
    console.error('Critical error in notification cron job:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Critical error in notification cron job',
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

// PUT endpoint for updating cron configuration (optional)
export async function PUT(request: NextRequest) {
  try {
    const { schedule, enabled } = await request.json();
    
    // Here you could update cron job settings in database if needed
    // This is placeholder for future configuration management
    
    return NextResponse.json({
      success: true,
      message: 'Cron configuration updated',
      config: {
        schedule: schedule || 'daily',
        enabled: enabled !== false
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update cron configuration' },
      { status: 500 }
    );
  }
}