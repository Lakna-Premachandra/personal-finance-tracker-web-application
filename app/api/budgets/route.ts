import { NextRequest, NextResponse } from 'next/server';
import { BudgetService } from '@/lib/services/budgetService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get all budgets or filter by year/month
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

    let budgets;

    if (year && month) {
      // Get budgets for specific month
      budgets = await BudgetService.getBudgetsByMonth(
        user.userId,
        parseInt(year),
        parseInt(month)
      );
    } else if (year) {
      // Get budgets for specific year
      budgets = await BudgetService.getBudgetsByYear(
        user.userId,
        parseInt(year)
      );
    } else {
      // Get all budgets
      budgets = await BudgetService.getAllBudgets(user.userId);
    }

    return NextResponse.json({
      success: true,
      data: budgets
    });

  } catch (error) {
    console.error('Error in GET /api/budgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add new budget
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
    const { categoryId, amount, year, month } = body;

    // Validate input
    if (!categoryId || !amount || !year || !month) {
      return NextResponse.json(
        { error: 'Category ID, amount, year, and month are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate year and month
    const currentYear = new Date().getFullYear();
    if (year < currentYear - 10 || year > currentYear + 10) {
      return NextResponse.json(
        { error: 'Year must be within reasonable range' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Check if budget already exists for this category and month
    const budgetExists = await BudgetService.checkBudgetExists(
      user.userId,
      categoryId,
      year,
      month
    );

    if (budgetExists) {
      return NextResponse.json(
        { error: 'Budget already exists for this category and month' },
        { status: 409 }
      );
    }

    const result = await BudgetService.addBudget(
      user.userId,
      categoryId,
      amount,
      year,
      month
    );

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message,
      data: { budgetId: result.Budget_ID }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/budgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
