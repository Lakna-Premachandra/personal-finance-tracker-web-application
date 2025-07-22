import { NextRequest, NextResponse } from 'next/server';
import { BudgetService } from '@/lib/services/budgetService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get budget status for categories
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
    const categoryId = searchParams.get('categoryId');
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

    if (categoryId) {
      // Get specific category budget status
      const status = await BudgetService.getBudgetStatus(
        user.userId,
        parseInt(categoryId),
        targetYear,
        targetMonth
      );
      
      if (!status) {
        return NextResponse.json(
          { error: 'Budget not found for this category and month' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: status
      });
    } else {
      // Get all budget categories with status for the month
      const statuses = await BudgetService.getBudgetCategoriesWithStatus(
        user.userId,
        targetYear,
        targetMonth
      );

      return NextResponse.json({
        success: true,
        data: statuses
      });
    }

  } catch (error) {
    console.error('Error in GET /api/budgets/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
