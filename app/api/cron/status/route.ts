import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, sql } from '@/lib/database/db';

export async function GET(request: NextRequest) {
  try {
    const pool = await connectToDatabase();
    const dbRequest = pool.request();
    
    // Get pending notifications count
    const pendingResult = await dbRequest.query(`
      SELECT COUNT(*) as PendingCount
      FROM Birthday_Notifications 
      WHERE Is_Processed = 0
    `);
    
    // Get users turning 18 today
    const birthdayRequest = pool.request();
    const birthdayResult = await birthdayRequest.execute('sp_CheckBirthdayTransitions');
    
    return NextResponse.json({
      success: true,
      data: {
        pendingNotifications: pendingResult.recordset[0].PendingCount,
        birthdayTransitionsToday: birthdayResult.recordset.length,
        lastChecked: new Date().toISOString(),
        upcomingTransitions: birthdayResult.recordset
      }
    });

  } catch (error: any) {
    console.error('Error getting cron status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get cron status' },
      { status: 500 }
    );
  }
}
