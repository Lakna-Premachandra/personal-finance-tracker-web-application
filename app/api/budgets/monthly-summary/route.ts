import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transactionService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get monthly summary report
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    const targetYear = parseInt(year);
    const targetMonth = parseInt(month);

    // Validate year and month
    if (isNaN(targetYear) || isNaN(targetMonth)) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      );
    }

    if (targetMonth < 1 || targetMonth > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    const summary = await TransactionService.getMonthlySpendingSummary(
      user.userId,
      targetYear,
      targetMonth
    );

    return NextResponse.json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        summary
      }
    });

  } catch (error) {
    console.error('Error in GET /api/reports/monthly-summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
