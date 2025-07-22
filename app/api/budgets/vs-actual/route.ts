import { NextRequest, NextResponse } from 'next/server';
import { BudgetService } from '@/lib/services/budgetService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get budget vs actual spending comparison
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

    // Default to current month if not provided
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;

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

    const comparison = await BudgetService.getBudgetVsActual(
      user.userId,
      targetYear,
      targetMonth
    );

    return NextResponse.json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        comparison
      }
    });

  } catch (error) {
    console.error('Error in GET /api/budgets/vs-actual:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
