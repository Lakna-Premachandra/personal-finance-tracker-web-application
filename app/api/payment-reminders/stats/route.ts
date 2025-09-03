import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { PaymentReminderService } from '@/lib/services/paymentReminderService';

const paymentReminderService = new PaymentReminderService();

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await paymentReminderService.getPaymentReminderStats(user.userId);
    
    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Error getting payment reminder stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get payment reminder stats' },
      { status: 500 }
    );
  }
}