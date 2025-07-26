import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/db';

export async function POST(request: NextRequest) {
  try {
    const pool = await connectToDatabase();
    
    // First update all user ages
    const ageUpdateRequest = pool.request();
    const ageUpdateResult = await ageUpdateRequest.execute('sp_UpdateUserAges');
    
    // Then send birthday notifications
    const notificationRequest = pool.request();
    const notificationResult = await notificationRequest.execute('sp_SendBirthdayNotifications');
    
    const notifiedUsers = notificationResult.recordset;
    
    return NextResponse.json({
      success: true,
      message: 'Birthday check completed successfully',
      agesUpdated: ageUpdateResult.recordset[0]?.UpdatedRows || 0,
      notificationsSent: notifiedUsers.length,
      notifiedUsers: notifiedUsers.map(user => ({
        userId: user.User_ID,
        username: user.Username,
        newAge: user.NewAge
      }))
    });

  } catch (error: any) {
    console.error('Error in birthday check cron job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run birthday check' },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint
export async function GET(request: NextRequest) {
  return POST(request); // Allow manual triggering via GET for testing
}
