import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { PaymentReminderService } from '@/lib/services/paymentReminderService';

const paymentReminderService = new PaymentReminderService();

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.userId);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (user.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const result = await paymentReminderService.getUserPaymentReminderNotifications(userId);
    
    return NextResponse.json({
      success: true,
      data: result.notifications,
      hasUnprocessedNotifications: result.hasUnprocessed
    });

  } catch (error: any) {
    console.error('Error getting payment reminder notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get payment reminder notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.userId);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (user.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const result = await paymentReminderService.markPaymentReminderNotificationAsProcessed(
      userId, 
      notificationId
    );

    return NextResponse.json({
      success: true,
      message: 'Payment reminder notification processed successfully',
      rowsAffected: result.rowsAffected
    });

  } catch (error: any) {
    console.error('Error processing payment reminder notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment reminder notification' },
      { status: 500 }
    );
  }
}