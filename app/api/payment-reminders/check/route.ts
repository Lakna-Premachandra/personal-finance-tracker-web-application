import { NextResponse } from 'next/server';
import { getCronService } from '@/lib/services/cronService';

export async function POST() {
  try {
    const cronService = getCronService();

    const result = await cronService.checkAndSendPaymentReminders();

    return NextResponse.json({
      success: true,
      message: 'Payment reminder check completed successfully',
      result: result?.length
        ? { count: result.length, reminders: result }
        : 'No reminders found'
    });
  } catch (error: any) {
    console.error('Error running payment reminder check:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run payment reminder check' },
      { status: 500 }
    );
  }
}

// Optional GET route for testing (triggers POST)
export async function GET() {
  return POST();
}
