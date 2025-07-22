import { NextRequest, NextResponse } from 'next/server';
import { BudgetService } from '@/lib/services/budgetService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get budget by ID
export async function GET(
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

    const budgetId = parseInt(params.id);
    if (isNaN(budgetId)) {
      return NextResponse.json(
        { error: 'Invalid budget ID' },
        { status: 400 }
      );
    }

    const budget = await BudgetService.getBudgetById(budgetId, user.userId);
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: budget
    });

  } catch (error) {
    console.error('Error in GET /api/budgets/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update budget
export async function PUT(
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

    const budgetId = parseInt(params.id);
    if (isNaN(budgetId)) {
      return NextResponse.json(
        { error: 'Invalid budget ID' },
        { status: 400 }
      );
    }

    // Check if budget already exists for this category and month (excluding current budget)
    const budgetExists = await BudgetService.checkBudgetExists(
      user.userId,
      categoryId,
      year,
      month,
      budgetId
    );

    if (budgetExists) {
      return NextResponse.json(
        { error: 'Budget already exists for this category and month' },
        { status: 409 }
      );
    }

    const result = await BudgetService.updateBudget(
      budgetId,
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
      message: result.Message
    });

  } catch (error) {
    console.error('Error in PUT /api/budgets/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete budget
export async function DELETE(
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

    const budgetId = parseInt(params.id);
    if (isNaN(budgetId)) {
      return NextResponse.json(
        { error: 'Invalid budget ID' },
        { status: 400 }
      );
    }

    const result = await BudgetService.deleteBudget(budgetId, user.userId);

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message
    });

  } catch (error) {
    console.error('Error in DELETE /api/budgets/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
