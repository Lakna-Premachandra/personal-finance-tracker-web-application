import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { PaymentReminderService } from '@/lib/services/paymentReminderService';

const paymentReminderService = new PaymentReminderService();

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, amount, category, dueDate, remindDaysBefore, frequency, isEnabled } = body;

    // Validation
    if (!title || !amount || !category || !dueDate || remindDaysBefore === undefined) {
      return NextResponse.json(
        { error: 'Title, amount, category, due date, and remind days before are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (![1, 3, 5, 7].includes(remindDaysBefore)) {
      return NextResponse.json(
        { error: 'Remind days before must be 1, 3, 5, or 7' },
        { status: 400 }
      );
    }

    if (frequency && !['weekly', 'monthly', 'quarterly', 'yearly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be weekly, monthly, quarterly, or yearly' },
        { status: 400 }
      );
    }

    const result = await paymentReminderService.createPaymentReminder(user.userId, {
      title,
      amount: parseFloat(amount),
      category,
      dueDate,
      remindDaysBefore,
      frequency,
      isEnabled: isEnabled ?? true
    });

    if (result.Status === 'Error') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message,
      reminderId: result.Reminder_ID
    });

  } catch (error: any) {
    console.error('Error creating payment reminder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment reminder' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await paymentReminderService.getUserPaymentReminders(user.userId);
    
    return NextResponse.json({
      success: true,
      data: result.reminders
    });

  } catch (error: any) {
    console.error('Error getting payment reminders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get payment reminders' },
      { status: 500 }
    );
  }
}
