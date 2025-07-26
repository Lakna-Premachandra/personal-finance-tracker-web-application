import { NextResponse } from 'next/server';
import { getCronService } from '@/lib/services/cronService';

// This endpoint can be called during server startup or deployment
export async function POST() {
  try {
    const cronService = getCronService();
    console.log('Cron service initialized and started');
    
    return NextResponse.json({
      success: true,
      message: 'Cron service started successfully',
      status: cronService.getStatus()
    });

  } catch (error: any) {
    console.error('Error starting cron service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start cron service' },
      { status: 500 }
    );
  }
}
