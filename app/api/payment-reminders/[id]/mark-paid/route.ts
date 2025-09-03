
// app/api/payment-reminders/[id]/mark-paid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { PaymentReminderService } from '@/lib/services/paymentReminderService';

const paymentReminderService = new PaymentReminderService();

// POST /api/payment-reminders/[id]/mark-paid - Mark payment as paid and create expense
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reminderId = parseInt(params.id);
    
    if (isNaN(reminderId)) {
      return NextResponse.json(
        { error: 'Invalid reminder ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { description } = body;

    const result = await paymentReminderService.markPaymentAsPaid(
      user.userId, 
      reminderId, 
      description
    );

    if (result.Status === 'Error') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message,
      nextDueDate: result.NextDueDate
    });

  } catch (error: any) {
    console.error('Error marking payment as paid:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark payment as paid' },
      { status: 500 }
    );
  }
}